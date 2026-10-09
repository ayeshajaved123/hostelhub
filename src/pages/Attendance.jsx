import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { todayStr, nowTime, crossCheck } from "../utils/logic.js";
import { Btn, EmptyState, FlagCard, CatPill } from "../components/ui.jsx";
import { inputCls } from "../components/ui.jsx";

export default function Attendance() {
  const [date, setDate] = useState(todayStr());
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [flags, setFlags] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [date]);
  async function load() {
    const [s, att] = await Promise.all([store.getStudents(), store.getAttendance(date)]);
    setStudents(s);
    const m = {};
    s.forEach((x) => { m[x.id] = att?.records?.[x.id] || "present"; });
    setMarks(m);
    setSaved(!!att);
    const alerts = await store.getAlerts();
    setFlags(alerts.filter((a) => a.date === date && a.type !== "late"));
  }

  const save = async () => {
    const gate = await store.getGateLog(date);
    const found = crossCheck(date, { ...marks }, gate, students);
    await store.saveAttendance({ date, records: { ...marks }, present: Object.values(marks).filter((v) => v === "present").length, savedAt: nowTime() });
    // persist flags as alerts
    const existing = await store.getAlerts();
    for (const f of found) {
      const dup = existing.some((a) => a.date === date && a.studentId === f.studentId && a.type === f.type);
      if (!dup) await store.saveAlert({ type: f.type, studentId: f.studentId, date, time: nowTime(), text: f.text, acknowledged: false });
    }
    const alerts = await store.getAlerts();
    setFlags(alerts.filter((a) => a.date === date && a.type !== "late"));
    setSaved(true);
    alert(found.length ? `${found.length} flag(s) detected — review required.` : "Attendance saved — no mismatches.");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <input type="date" className={inputCls + " !w-48"} value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => { const m = {}; students.forEach((s) => { m[s.id] = "present"; }); setMarks(m); }}>All Present</Btn>
          <Btn onClick={save}>Save & Cross-Check</Btn>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold">Night Attendance</h3>
          <span className="text-xs text-slate-500">Saving runs automatic gate-log cross-check{saved ? " · saved" : ""}</span>
        </div>
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {students.map((s) => (
            <div key={s.id} className="border border-slate-200 rounded-xl px-4 py-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm">{s.name}</div>
                <div className="text-xs text-slate-400">{s.rollNo} · {s.category}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setMarks({ ...marks, [s.id]: "present" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${marks[s.id] === "present" ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-200 text-slate-400"}`}>Present</button>
                <button onClick={() => setMarks({ ...marks, [s.id]: "absent" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${marks[s.id] === "absent" ? "bg-red-600 border-red-600 text-white" : "border-slate-200 text-slate-400"}`}>Absent</button>
              </div>
            </div>
          ))}
          {!students.length && <EmptyState text="No students yet." />}
        </div>
      </div>

      {flags.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200 font-bold">Auto-Detected Flags ({flags.length})</div>
          <div className="p-5">{flags.map((f) => <FlagCard key={f.id} text={f.text} time={`${f.date} ${f.time || ""}`} />)}</div>
        </div>
      )}
    </div>
  );
}
