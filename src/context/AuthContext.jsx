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

  return <AuthCtx.Provider value={{ user, loginDemo, login, logout, isDemo: !isConfigured }}>{children}</AuthCtx.Provider>;
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
