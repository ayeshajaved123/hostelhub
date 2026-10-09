import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { todayStr, nowTime } from "../utils/logic.js";
import { useAuth, can } from "../context/AuthContext.jsx";
import { Pill, CatPill, Btn, EmptyState, Modal, Field, inputCls } from "../components/ui.jsx";

export default function Permissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(null);
  const [approveId, setApproveId] = useState(null);
  const [approver, setApprover] = useState("");
  const [form, setForm] = useState({ studentId: "", purpose: "", dateOut: todayStr(), timeOut: "17:00", expectedReturn: "20:00" });
  const mayApprove = can(user, "approvePermissions");

  useEffect(() => { load(); }, []);
  async function load() {
    const [p, s] = await Promise.all([store.getPermissions(), store.getStudents()]);
    setPermissions(p); setStudents(s);
    if (!form.studentId && s.length) setForm((f) => ({ ...f, studentId: user.studentId || s[0].id }));
  }
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  const pending = permissions.filter((p) => p.status === "pending");
  const done = permissions.filter((p) => p.status !== "pending").reverse();

  const submit = async () => {
    if (!form.purpose.trim()) { alert("Purpose is required."); return; }
    await store.savePermission({ ...form, status: "pending", decidedBy: "", createdAt: todayStr() + " " + nowTime() });
    setModal(null); load();
  };

  const decide = async (id, status) => {
    if (status === "approved") {
      if (!approver.trim()) { alert("Approver (warden) name is required for the stamp."); return; }
      await store.updatePermission(id, { status, decidedBy: approver.trim() });
    } else {
      await store.updatePermission(id, { status, decidedBy: user.name });
    }
    setApproveId(null); setApprover(""); load();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Btn onClick={() => setModal(true)}>+ New Permission Slip</Btn>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-slate-200 font-bold">Awaiting Approval</div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3">Student</th><th className="px-3 py-3">Purpose</th><th className="px-3 py-3">Going Out</th><th className="px-3 py-3">Expected Return</th><th className="px-3 py-3"></th>
          </tr></thead>
          <tbody>
            {pending.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-semibold">{byId[p.studentId]?.name} <CatPill category={byId[p.studentId]?.category} /></td>
                <td className="px-3 py-3">{p.purpose}</td>
                <td className="px-3 py-3">{p.dateOut} {p.timeOut}</td>
                <td className="px-3 py-3">{p.expectedReturn}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {mayApprove ? (
                    approveId === p.id ? (
                      <span className="flex gap-2 items-center">
                        <input className={inputCls + " !w-40 !py-1.5"} placeholder="Warden name (stamp)" value={approver} onChange={(e) => setApprover(e.target.value)} />
                        <Btn size="sm" onClick={() => decide(p.id, "approved")}>Stamp</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setApproveId(null)}>Cancel</Btn>
                      </span>
                    ) : (
                      <span className="flex gap-2">
                        <Btn size="sm" onClick={() => setApproveId(p.id)}>Approve</Btn>
                        <Btn size="sm" variant="danger" onClick={() => decide(p.id, "rejected")}>Reject</Btn>
                      </span>
                    )
                  ) : <Pill color="amber">Pending</Pill>}
                </td>
              </tr>
            ))}
            {!pending.length && <tr><td colSpan="5"><EmptyState text="No pending slips." /></td></tr>}
          </tbody>
        </table></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 font-bold">Decided Slips</div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3">Student</th><th className="px-3 py-3">Purpose</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Decided By</th>
          </tr></thead>
          <tbody>
            {done.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-semibold">{byId[p.studentId]?.name}</td>
                <td className="px-3 py-3">{p.purpose}</td>
                <td className="px-3 py-3">{p.status === "approved" ? <Pill color="green">Approved</Pill> : <Pill color="red">Rejected</Pill>}</td>
                <td className="px-3 py-3">{p.decidedBy || "—"}</td>
              </tr>
            ))}
            {!done.length && <tr><td colSpan="4"><EmptyState text="No decided slips yet." /></td></tr>}
          </tbody>
        </table></div>
      </div>

      {modal && (
        <Modal title="New Permission Slip" onClose={() => setModal(null)}>
          <Field label="Student">
            <select className={inputCls} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
            </select>
          </Field>
          <Field label="Purpose"><input className={inputCls} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Family visit, medical, shopping" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date"><input type="date" className={inputCls} value={form.dateOut} onChange={(e) => setForm({ ...form, dateOut: e.target.value })} /></Field>
            <Field label="Going Out At"><input type="time" className={inputCls} value={form.timeOut} onChange={(e) => setForm({ ...form, timeOut: e.target.value })} /></Field>
            <Field label="Expected Return"><input type="time" className={inputCls} value={form.expectedReturn} onChange={(e) => setForm({ ...form, expectedReturn: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={submit}>Submit for Approval</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
