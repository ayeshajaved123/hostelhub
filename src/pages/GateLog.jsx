import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { todayStr, nowTime } from "../utils/logic.js";
import { Pill, Btn, EmptyState, Modal, Field, inputCls } from "../components/ui.jsx";

export default function GateLog() {
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [exitModal, setExitModal] = useState(false);
  const [returnId, setReturnId] = useState(null);
  const [form, setForm] = useState({ studentId: "", accompaniedBy: "", time: nowTime(), permissionId: "", sign: "" });
  const [retForm, setRetForm] = useState({ time: nowTime(), receivedBy: "" });

  useEffect(() => { load(); }, [date]);
  async function load() {
    const [g, s, p] = await Promise.all([store.getGateLog(date), store.getStudents(), store.getPermissions()]);
    setRows(g.sort((a, b) => (a.exitTime < b.exitTime ? -1 : 1)));
    setStudents(s);
    setPermissions(p);
    if (!form.studentId && s.length) setForm((f) => ({ ...f, studentId: s[0].id, accompaniedBy: "Self" }));
  }
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));

  const openExit = () => {
    const s = students[0];
    setForm({ studentId: s?.id || "", accompaniedBy: s?.category === "guardian" ? "" : "Self", time: nowTime(), permissionId: "", sign: "" });
    setExitModal(true);
  };
  const onStudentChange = (id) => {
    const s = byId[id];
    setForm((f) => ({ ...f, studentId: id, accompaniedBy: s?.category === "guardian" ? "" : "Self" }));
  };
  const approvedPerms = permissions.filter((p) => p.status === "approved" && p.studentId === form.studentId);

  const saveExit = async () => {
    const s = byId[form.studentId];
    if (!s) return;
    if (s.category === "guardian" && (!form.accompaniedBy.trim() || /self/i.test(form.accompaniedBy))) {
      alert("Guardian-category student needs a guardian companion."); return;
    }
    if (!form.sign.trim()) { alert("Student signature is required."); return; }
    const already = rows.some((g) => g.studentId === form.studentId && g.exitTime && !g.entryTime);
    if (already) { alert("This student is already marked outside."); return; }
    await store.saveGateEntry({
      studentId: form.studentId, permissionId: form.permissionId, date,
      exitTime: form.time, accompaniedBy: form.accompaniedBy.trim() || "Self",
      entryTime: "", receivedBy: "", sign: form.sign.trim()
    });
    setExitModal(false); load();
  };

  const openReturn = (g) => { setReturnId(g.id); setRetForm({ time: nowTime(), receivedBy: g.accompaniedBy || "" }); };
  const saveReturn = async () => {
    await store.updateGateEntry(returnId, { entryTime: retForm.time, receivedBy: retForm.receivedBy.trim() || "—" });
    setReturnId(null); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <input type="date" className={inputCls + " !w-48"} value={date} onChange={(e) => setDate(e.target.value)} />
        <Btn onClick={openExit}>+ Mark Exit</Btn>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold">Gate Register</h3>
          <span className="text-xs text-slate-500">Guard's digital register — exit and return ticks</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3">Student</th><th className="px-3 py-3">Exit Time</th><th className="px-3 py-3">Accompanied By</th>
            <th className="px-3 py-3">Return Time</th><th className="px-3 py-3">Received By</th><th className="px-3 py-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-semibold">{byId[g.studentId]?.name}<div className="text-xs text-slate-400 font-normal">{byId[g.studentId]?.rollNo}</div></td>
                <td className="px-3 py-3">{g.exitTime}</td>
                <td className="px-3 py-3">{g.accompaniedBy}</td>
                <td className="px-3 py-3">{g.entryTime || <Pill color="amber">Out</Pill>}</td>
                <td className="px-3 py-3">{g.receivedBy || "—"}</td>
                <td className="px-3 py-3">{g.entryTime ? null : <Btn size="sm" onClick={() => openReturn(g)}>Mark Return</Btn>}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="6"><EmptyState text="No gate movements on this date." /></td></tr>}
          </tbody>
        </table>
      </div>

      {exitModal && (
        <Modal title="Mark Exit (Going Out)" onClose={() => setExitModal(false)}>
          <Field label="Student">
            <select className={inputCls} value={form.studentId} onChange={(e) => onStudentChange(e.target.value)}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNo}) — {s.category}</option>)}
            </select>
          </Field>
          <Field label="Accompanied By">
            <input className={inputCls} value={form.accompaniedBy} onChange={(e) => setForm({ ...form, accompaniedBy: e.target.value })} placeholder="Self / guardian name" />
            <p className="text-xs text-slate-400 mt-1">Guardian-category students must go with their guardian.</p>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Exit Time"><input type="time" className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
            <Field label="Linked Permission Slip">
              <select className={inputCls} value={form.permissionId} onChange={(e) => setForm({ ...form, permissionId: e.target.value })}>
                <option value="">— none —</option>
                {approvedPerms.map((p) => <option key={p.id} value={p.id}>{p.purpose} ({p.timeOut})</option>)}
              </select>
            </Field>
          </div>
          <Field label="Student Sign (type full name as signature)"><input className={inputCls} value={form.sign} onChange={(e) => setForm({ ...form, sign: e.target.value })} placeholder="Student signature" /></Field>
          <div className="flex justify-end gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setExitModal(false)}>Cancel</Btn>
            <Btn onClick={saveExit}>Tick Exit</Btn>
          </div>
        </Modal>
      )}

      {returnId && (
        <Modal title="Mark Return" onClose={() => setReturnId(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Return Time"><input type="time" className={inputCls} value={retForm.time} onChange={(e) => setRetForm({ ...retForm, time: e.target.value })} /></Field>
            <Field label="Received / Brought Back By"><input className={inputCls} value={retForm.receivedBy} onChange={(e) => setRetForm({ ...retForm, receivedBy: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setReturnId(null)}>Cancel</Btn>
            <Btn onClick={saveReturn}>Tick Return</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
