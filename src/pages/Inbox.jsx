import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { Btn, EmptyState, Pill } from "../components/ui.jsx";

const TABS = [
  { id: "all", label: "All" },
  { id: "late", label: "Late Returns" },
  { id: "mismatch", label: "Attendance Mismatches" },
  { id: "guardian", label: "Guardian Breaches" }
];

export default function Inbox() {
  const [alerts, setAlerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState("all");

  useEffect(() => { load(); }, []);
  async function load() {
    const [a, s] = await Promise.all([store.getAlerts(), store.getStudents()]);
    setAlerts(a); setStudents(s);
  }
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  const rows = alerts.filter((a) => tab === "all" || a.type === tab);
  const count = (t) => alerts.filter((a) => !a.acknowledged && (t === "all" || a.type === t)).length;

  const ack = async (id) => { await store.ackAlert(id); load(); };
  const typePill = (t) =>
    t === "late" ? <Pill color="red">Late Return</Pill> :
    t === "mismatch" ? <Pill color="amber">Mismatch</Pill> :
    t === "guardian" ? <Pill color="blue">Guardian</Pill> : <Pill color="gray">Info</Pill>;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${tab === t.id ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-slate-200 text-slate-500"}`}>
            {t.label}{count(t.id) ? ` (${count(t.id)})` : ""}
          </button>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        {rows.length ? rows.map((a) => (
          <div key={a.id} className={`border rounded-xl px-4 py-3.5 mb-3 ${a.acknowledged ? "border-slate-200 bg-slate-50 opacity-70" : a.type === "late" ? "border-red-200 bg-red-50/50 border-l-4 border-l-red-600" : "border-amber-200 bg-amber-50/50 border-l-4 border-l-amber-500"}`}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="mb-1.5">{typePill(a.type)}</div>
                <div className="text-sm">{a.text}</div>
                <div className="text-xs text-slate-400 mt-1">{a.date} · {a.time}</div>
              </div>
              {!a.acknowledged
                ? <Btn size="sm" variant="danger" onClick={() => ack(a.id)}>Acknowledge</Btn>
                : <span className="text-xs font-bold text-slate-400">Acknowledged</span>}
            </div>
          </div>
        )) : <EmptyState text="All clear — no alerts." />}
      </div>
    </div>
  );
}
