import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { RolePill, Btn, EmptyState } from "../components/ui.jsx";

export default function Roles() {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => { load(); }, []);
  async function load() {
    const [s, u] = await Promise.all([store.getStudents(), store.getUsers()]);
    setStudents(s); setUsers(u.filter((x) => x.role !== "warden" || true));
  }

  const setRole = async (id, role) => {
    await store.setRole(id, role);
    load();
  };

  return (
    <div>
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
