import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { useAuth } from "../context/AuthContext.jsx";
import { RolePill, Btn, EmptyState, Field, inputCls } from "../components/ui.jsx";

export default function Roles() {
  const { createStaffUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "guard" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const [s, u] = await Promise.all([store.getStudents(), store.getUsers()]);
    setStudents(s); setUsers(u.filter((x) => x.role !== "warden" || true));
  }

  const setRole = async (id, role) => {
    await store.setRole(id, role);
    load();
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setMsg({ type: "err", text: "Name, email and a 6+ character password are required." });
      return;
    }
    setBusy(true);
    try {
      await createStaffUser(form.name.trim(), form.email.trim(), form.password, form.role);
      setMsg({ type: "ok", text: `Account created for ${form.email.trim()} — they can sign in now.` });
      setForm({ name: "", email: "", password: "", role: "guard" });
      load();
    } catch (ex) {
      setMsg({ type: "err", text: ex?.message?.replace("Firebase:", "").trim() || "Failed to create account." });
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-slate-200 font-bold">Create Staff Account</div>
        <form onSubmit={createAccount} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name"><input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Ahmed Khan" /></Field>
          <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="guard@hostelhub.pk" /></Field>
          <Field label="Password (6+ characters)"><input className={inputCls} type="password" value={form.password} onChange={set("password")} placeholder="••••••••" /></Field>
          <Field label="Role">
            <select className={inputCls} value={form.role} onChange={set("role")}>
              <option value="guard">Guard</option>
              <option value="warden">Warden</option>
            </select>
          </Field>
          <div className="md:col-span-2 flex items-center gap-3">
            <Btn type="submit" disabled={busy}>{busy ? "Creating…" : "Create Account"}</Btn>
            {msg.text && <span className={`text-sm font-semibold ${msg.type === "ok" ? "text-teal-700" : "text-red-600"}`}>{msg.text}</span>}
          </div>
        </form>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 mb-4">
        CRs can approve permission slips and mark attendance. Assign or revoke the CR role for any student below.
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 font-bold">Roles Management</div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3">Name</th><th className="px-3 py-3">Roll No</th><th className="px-3 py-3">Current Role</th><th className="px-3 py-3">Action</th>
          </tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-semibold">{s.name}</td>
                <td className="px-3 py-3">{s.rollNo}</td>
                <td className="px-3 py-3"><RolePill role={s.role || "student"} /></td>
                <td className="px-3 py-3">
                  {(s.role === "cr")
                    ? <Btn size="sm" variant="ghost" onClick={() => setRole(s.id, "student")}>Revoke</Btn>
                    : <Btn size="sm" onClick={() => setRole(s.id, "cr")}>Assign CR</Btn>}
                </td>
              </tr>
            ))}
            {!students.length && <tr><td colSpan="4"><EmptyState text="No students yet." /></td></tr>}
          </tbody>
        </table></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-5">
        <div className="px-5 py-3.5 border-b border-slate-200 font-bold">Staff Accounts</div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3">Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Role</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-semibold">{u.name}</td>
                <td className="px-3 py-3">{u.email}</td>
                <td className="px-3 py-3"><RolePill role={u.role} /></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
