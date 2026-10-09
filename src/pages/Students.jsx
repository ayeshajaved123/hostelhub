import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { store } from "../data/store.js";
import { todayStr, parseCSV } from "../utils/logic.js";
import { Pill, CatPill, Btn, EmptyState, Modal, Field, inputCls } from "../components/ui.jsx";

const BLANK = { name: "", rollNo: "", phone: "", category: "self", department: "", room: "", guardianName: "", guardianPhone: "", homePhone: "", medical: "", role: "student" };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [gate, setGate] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null); // {student} | {import:true}
  const [form, setForm] = useState(BLANK);
  const [csvText, setCsvText] = useState("");
  const t = todayStr();

  useEffect(() => { load(); }, []);
  async function load() {
    const [s, g, a] = await Promise.all([store.getStudents(), store.getGateLog(t), store.getAlerts()]);
    setStudents(s); setGate(g); setAlerts(a);
  }

  const openAdd = () => { setForm({ ...BLANK }); setModal({ add: true }); };
  const openEdit = (s) => { setForm({ ...s }); setModal({ edit: s.id }); };

  const save = async () => {
    if (!form.name.trim() || !form.rollNo.trim()) { alert("Name and roll no are required."); return; }
    const rec = modal.edit ? { ...form, id: modal.edit } : { ...form };
    await store.saveStudent(rec);
    setModal(null); load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;
    await store.deleteStudent(id); load();
  };

  const doImport = async () => {
    const list = parseCSV(csvText);
    if (!list.length) { alert("No valid rows found. First row must be headers: name, rollno, phone, category, department, room, guardianname, guardianphone, homephone, medical"); return; }
    const n = await store.importStudents(list);
    setModal(null); setCsvText(""); load();
    alert(n + " students imported.");
  };

  const rows = students.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase()) || s.rollNo.toLowerCase().includes(q.toLowerCase()));

  const isOut = (id) => gate.some((g) => g.studentId === id && g.exitTime && !g.entryTime);
  const flagCount = (id) => alerts.filter((a) => a.studentId === id && !a.acknowledged).length;

  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <input className={inputCls + " max-w-xs"} placeholder="Search by name or roll no..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => setModal({ import: true })}>Import CSV</Btn>
          <Btn onClick={openAdd}>+ Add Student</Btn>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3">Name</th><th className="px-3 py-3">Roll No</th><th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Room</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Flags</th><th className="px-3 py-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-semibold">{s.name}{s.role === "cr" && <span className="ml-2"><Pill color="blue">CR</Pill></span>}</td>
                <td className="px-3 py-3">{s.rollNo}</td>
                <td className="px-3 py-3"><CatPill category={s.category} /></td>
                <td className="px-3 py-3">{s.room || "—"}</td>
                <td className="px-3 py-3">{isOut(s.id) ? <Pill color="amber">Outside</Pill> : <Pill color="green">Inside</Pill>}</td>
                <td className="px-3 py-3">{flagCount(s.id) ? <Pill color="red">{flagCount(s.id)}</Pill> : <span className="text-slate-300">—</span>}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <Link to={`/students/${s.id}`}><Btn size="sm" variant="ghost">Profile</Btn></Link>{" "}
                  <Btn size="sm" variant="ghost" onClick={() => openEdit(s)}>Edit</Btn>{" "}
                  <Btn size="sm" variant="danger" onClick={() => remove(s.id)}>Delete</Btn>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="7"><EmptyState text="No students found." /></td></tr>}
          </tbody>
        </table>
      </div>

      {(modal?.add || modal?.edit) && (
        <Modal title={modal.edit ? "Edit Student" : "Add Student"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Full Name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Roll No"><input className={inputCls} value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} /></Field>
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="self">Self — may go out alone</option>
                <option value="guardian">Guardian — only with guardian</option>
              </select>
            </Field>
            <Field label="Department"><input className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
            <Field label="Room No"><input className={inputCls} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Guardian Name"><input className={inputCls} value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></Field>
            <Field label="Guardian Phone"><input className={inputCls} value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} /></Field>
            <Field label="Home Emergency Number"><input className={inputCls} value={form.homePhone} onChange={(e) => setForm({ ...form, homePhone: e.target.value })} /></Field>
            <Field label="Medical Notes"><input className={inputCls} value={form.medical} onChange={(e) => setForm({ ...form, medical: e.target.value })} placeholder="Disease, allergy, condition..." /></Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}

      {modal?.import && (
        <Modal title="Import Students (CSV)" onClose={() => setModal(null)} wide>
          <p className="text-sm text-slate-500 mb-3">Paste CSV with header row: <code className="text-xs bg-slate-100 px-1 rounded">name, rollno, phone, category, department, room, guardianname, guardianphone, homephone, medical</code></p>
          <textarea className={inputCls + " h-48 font-mono text-xs"} value={csvText} onChange={(e) => setCsvText(e.target.value)}
            placeholder={"name,rollno,phone,category,department,room,guardianname,guardianphone,homephone,medical\nAyesha Khan,RWU-21-014,03014455667,self,IT,B-12,Rashid Khan,03014455660,0514441234,"} />
          <div className="flex justify-end gap-2 mt-4">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={doImport}>Import</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
