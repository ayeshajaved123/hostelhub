// Data layer — localStorage demo adapter + Firestore adapter.
// When firebase.js has real config, Firestore is used automatically.
// Otherwise the app runs fully offline in demo mode.
import { isConfigured, db } from "../firebase.js";
import { seedData } from "./seed.js";

const LS_KEY = "hostelhub_demo_v1";
const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

/* ---------------- local (demo) adapter ---------------- */
function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const d = seedData();
  localStorage.setItem(LS_KEY, JSON.stringify(d));
  return d;
}
function saveLocal(d) {
  localStorage.setItem(LS_KEY, JSON.stringify(d));
}

const local = {
  async getStudents() { return loadLocal().students; },
  async saveStudent(s) {
    const d = loadLocal();
    const i = d.students.findIndex((x) => x.id === s.id);
    if (i > -1) d.students[i] = s; else { s.id = s.id || uid("st"); d.students.push(s); }
    saveLocal(d); return s;
  },
  async deleteStudent(id) {
    const d = loadLocal();
    d.students = d.students.filter((x) => x.id !== id);
    saveLocal(d);
  },
  async importStudents(list) {
    const d = loadLocal();
    list.forEach((s) => { s.id = uid("st"); s.role = s.role || "student"; d.students.push(s); });
    saveLocal(d); return list.length;
  },
  async setRole(id, role) {
    const d = loadLocal();
    const s = d.students.find((x) => x.id === id);
    if (s) s.role = role;
    saveLocal(d);
  },
  async getPermissions() { return loadLocal().permissions; },
  async savePermission(p) {
    const d = loadLocal();
    const i = d.permissions.findIndex((x) => x.id === p.id);
    if (i > -1) d.permissions[i] = p; else { p.id = p.id || uid("pm"); d.permissions.push(p); }
    saveLocal(d); return p;
  },
  async updatePermission(id, patch) {
    const d = loadLocal();
    const p = d.permissions.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    saveLocal(d);
  },
  async getGateLog(date) { return loadLocal().gateLog.filter((g) => g.date === date); },
  async saveGateEntry(e) {
    const d = loadLocal();
    e.id = e.id || uid("g"); d.gateLog.push(e); saveLocal(d); return e;
  },
  async updateGateEntry(id, patch) {
    const d = loadLocal();
    const g = d.gateLog.find((x) => x.id === id);
    if (g) Object.assign(g, patch);
    saveLocal(d);
  },
  async getAttendance(date) {
    return loadLocal().attendance.find((a) => a.date === date) || null;
  },
  async saveAttendance(rec) {
    const d = loadLocal();
    const i = d.attendance.findIndex((a) => a.date === rec.date);
    if (i > -1) d.attendance[i] = rec; else d.attendance.push(rec);
    saveLocal(d);
  },
  async getAlerts() { return loadLocal().alerts; },
  async saveAlert(a) {
    const d = loadLocal();
    a.id = a.id || uid("al"); d.alerts.unshift(a); saveLocal(d); return a;
  },
  async ackAlert(id) {
    const d = loadLocal();
    const a = d.alerts.find((x) => x.id === id);
    if (a) a.acknowledged = true;
    saveLocal(d);
  },
  async getUsers() { return loadLocal().users; },
  async saveUser(u) {
    const d = loadLocal();
    const i = d.users.findIndex((x) => x.email === u.email);
    if (i > -1) d.users[i] = { ...d.users[i], ...u };
    else { u.id = u.id || uid("u"); d.users.push(u); }
    saveLocal(d); return u;
  },
  async resetDemo() { localStorage.removeItem(LS_KEY); }
};

/* ---------------- firestore adapter ---------------- */
let f = null;
async function fmod() {
  if (!f) f = await import("firebase/firestore");
  return f;
}
const fire = {
  async _col(name) {
    const m = await fmod();
    return m.collection(db, name);
  },
  async _all(name) {
    const m = await fmod();
    const snap = await m.getDocs(m.collection(db, name));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async getStudents() { return this._all("students"); },
  async saveStudent(s) {
    const m = await fmod();
    if (s.id) await m.setDoc(m.doc(db, "students", s.id), s, { merge: true });
    else { const r = await m.addDoc(m.collection(db, "students"), s); s.id = r.id; }
    return s;
  },
  async deleteStudent(id) {
    const m = await fmod();
    await m.deleteDoc(m.doc(db, "students", id));
  },
  async importStudents(list) {
    const m = await fmod();
    const batch = m.writeBatch(db);
    list.forEach((s) => { batch.set(m.doc(m.collection(db, "students")), { ...s, role: s.role || "student" }); });
    await batch.commit(); return list.length;
  },
  async setRole(id, role) {
    const m = await fmod();
    await m.setDoc(m.doc(db, "students", id), { role }, { merge: true });
  },
  async getPermissions() { return this._all("permissions"); },
  async savePermission(p) {
    const m = await fmod();
    if (p.id) await m.setDoc(m.doc(db, "permissions", p.id), p, { merge: true });
    else { const r = await m.addDoc(m.collection(db, "permissions"), p); p.id = r.id; }
    return p;
  },
  async updatePermission(id, patch) {
    const m = await fmod();
    await m.setDoc(m.doc(db, "permissions", id), patch, { merge: true });
  },
  async getGateLog(date) {
    const m = await fmod();
    const q = m.query(m.collection(db, "gateLog"), m.where("date", "==", date));
    const snap = await m.getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async saveGateEntry(e) {
    const m = await fmod();
    const r = await m.addDoc(m.collection(db, "gateLog"), e);
    e.id = r.id; return e;
  },
  async updateGateEntry(id, patch) {
    const m = await fmod();
    await m.setDoc(m.doc(db, "gateLog", id), patch, { merge: true });
  },
  async getAttendance(date) {
    const m = await fmod();
    const q = m.query(m.collection(db, "attendance"), m.where("date", "==", date), m.limit(1));
    const snap = await m.getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },
  async saveAttendance(rec) {
    const m = await fmod();
    const q = m.query(m.collection(db, "attendance"), m.where("date", "==", rec.date), m.limit(1));
    const snap = await m.getDocs(q);
    if (snap.empty) await m.addDoc(m.collection(db, "attendance"), rec);
    else await m.setDoc(snap.docs[0].ref, rec, { merge: true });
  },
  async getAlerts() {
    const all = await this._all("alerts");
    return all.sort((a, b) => (b.date + b.time) > (a.date + a.time) ? 1 : -1);
  },
  async saveAlert(a) {
    const m = await fmod();
    const r = await m.addDoc(m.collection(db, "alerts"), a);
    a.id = r.id; return a;
  },
  async ackAlert(id) {
    const m = await fmod();
    await m.setDoc(m.doc(db, "alerts", id), { acknowledged: true }, { merge: true });
  },
  async getUsers() { return this._all("users"); },
  async saveUser(u) {
    const m = await fmod();
    await m.setDoc(m.doc(db, "users", u.id), { email: u.email, role: u.role, name: u.name });
    return u;
  },
  async resetDemo() {}
};

const adapter = isConfigured ? fire : local;

export const store = { ...adapter, isDemo: !isConfigured };
export { uid };
