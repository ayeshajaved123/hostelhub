import { createContext, useContext, useState, useEffect } from "react";
import { isConfigured, auth } from "../firebase.js";

const AuthCtx = createContext(null);

// Demo users (used when Firebase is not configured)
const DEMO_USERS = [
  { email: "warden@hostelhub.pk", role: "warden", name: "Warden" },
  { email: "guard@hostelhub.pk", role: "guard", name: "Security Guard" },
  { email: "cr@hostelhub.pk", role: "cr", name: "Sana Ali (CR)", studentId: "st_a3" },
  { email: "student@hostelhub.pk", role: "student", name: "Mahnoor Fatima", studentId: "st_a1" }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hg_user")) || null; } catch (e) { return null; }
  });

  useEffect(() => {
    if (!isConfigured) return;
    let unsub = () => {};
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) { setUser(null); return; }
        // Role lookup from users collection
        const { getDocs, collection, query, where, limit, getFirestore } = await import("firebase/firestore");
        const db = getFirestore();
        const q = query(collection(db, "users"), where("email", "==", fbUser.email), limit(1));
        const snap = await getDocs(q);
        const rec = snap.empty ? { role: "student" } : snap.docs[0].data();
        const u = { email: fbUser.email, role: rec.role || "student", name: rec.name || fbUser.email, studentId: rec.studentId };
        setUser(u);
        localStorage.setItem("hg_user", JSON.stringify(u));
      });
    });
    return () => unsub();
  }, []);

  const loginDemo = (role) => {
    const u = DEMO_USERS.find((x) => x.role === role);
    setUser(u);
    localStorage.setItem("hg_user", JSON.stringify(u));
  };

  const login = async (email, password) => {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isConfigured) {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem("hg_user");
  };

  // Warden creates a staff login (guard/warden). Uses a secondary Firebase app
  // instance so the warden stays signed in on the primary app.
  const createStaffUser = async (name, email, password, role) => {
    if (!isConfigured) {
      const { store } = await import("../data/store.js");
      return store.saveUser({ name, email, role });
    }
    const { initializeApp, deleteApp } = await import("firebase/app");
    const { getAuth, createUserWithEmailAndPassword, signOut } = await import("firebase/auth");
    const { doc, setDoc } = await import("firebase/firestore");
    const { firebaseConfig, db } = await import("../firebase.js");
    const secondary = initializeApp(firebaseConfig, "staff-creator-" + Date.now());
    try {
      const sAuth = getAuth(secondary);
      const cred = await createUserWithEmailAndPassword(sAuth, email, password);
      await signOut(sAuth);
      await setDoc(doc(db, "users", cred.user.uid), { email, role, name });
      return { id: cred.user.uid, name, email, role };
    } finally {
      await deleteApp(secondary);
    }
  };

  return <AuthCtx.Provider value={{ user, loginDemo, login, logout, createStaffUser, isDemo: !isConfigured }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export const can = (user, action) => {
  const r = user?.role;
  const matrix = {
    manageStudents: ["warden"],
    assignCR: ["warden"],
    approvePermissions: ["warden", "cr"],
    gateLog: ["warden", "guard"],
    attendance: ["warden", "cr"],
    inbox: ["warden"],
    reports: ["warden", "cr"]
  };
  return (matrix[action] || []).includes(r);
};
