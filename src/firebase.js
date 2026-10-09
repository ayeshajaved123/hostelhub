// Firebase configuration — HostelHub app.
// Paste your Firebase web app config below (Project Settings → Your apps).
// Without real values, the app runs in demo mode (localStorage) with seed data.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export const isConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");

let auth = null;
let db = null;

if (isConfigured) {
  const { initializeApp } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const { getFirestore, enableIndexedDbPersistence } = await import("firebase/firestore");
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  // Offline-first: Firestore persists locally and syncs when back online
  enableIndexedDbPersistence(db).catch(() => {});
}

export { auth, db };
