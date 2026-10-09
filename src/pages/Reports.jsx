import { useEffect, useState } from "react";
import { store } from "../data/store.js";
import { todayStr, nowTime } from "../utils/logic.js";
import { Pill, Btn, EmptyState } from "../components/ui.jsx";
import { inputCls } from "../components/ui.jsx";

export default function Reports() {
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState({ gate: [], students: [], att: null, alerts: [] });

  useEffect(() => { load(); }, [date]);
  async function load() {
    const [gate, students, att, alerts] = await Promise.all([
      store.getGateLog(date), store.getStudents(), store.getAttendance(date), store.getAlerts()
    ]);
    setData({ gate: gate.sort((a, b) => (a.exitTime < b.exitTime ? -1 : 1)), students, att, alerts: alerts.filter((a) => a.date === date) });
  }
  const byId = Object.fromEntries(data.students.map((s) => [s.id, s]));
  const absent = data.att ? data.students.filter((s) => data.att.records[s.id] === "absent") : [];
  const flagCounts = {};
  data.alerts.forEach((a) => { flagCounts[a.studentId] = (flagCounts[a.studentId] || 0) + 1; });
  const offenders = Object.entries(flagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 no-print">
        <input type="date" className={inputCls + " !w-48"} value={date} onChange={(e) => setDate(e.target.value)} />
        <Btn onClick={() => window.print()}>Print Sheet</Btn>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-7">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-extrabold">HostelHub — Daily Sheet</h2>
            <p className="text-sm text-slate-500">Hostel Movement & Attendance</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Date: <b className="text-slate-800">{date}</b></div>
            <div>Generated: {todayStr()} {nowTime()}</div>
          </div>
        </div>

        <h3 className="font-bold text-base mb-3 pb-2 border-b-2 border-slate-100">1. Gate Movements ({data.gate.length})</h3>
        {data.gate.length ? (
          <table className="w-full text-sm mb-6">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="py-2">Student</th><th className="py-2">Exit</th><th className="py-2">Accompanied By</th><th className="py-2">Return</th><th className="py-2">Received By</th>
            </tr></thead>
            <tbody>{data.gate.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="py-2.5">{byId[g.studentId]?.name} ({byId[g.studentId]?.rollNo})</td>
                <td className="py-2.5">{g.exitTime}</td><td className="py-2.5">{g.accompaniedBy}</td>
                <td className="py-2.5">{g.entryTime || <Pill color="amber">Out</Pill>}</td>
                <td className="py-2.5">{g.receivedBy || "—"}</td>
              </tr>))}
            </tbody>
          </table>
        ) : <EmptyState text="No movements recorded." />}

        <h3 className="font-bold text-base mb-3 pb-2 border-b-2 border-slate-100">2. Night Attendance Summary</h3>
        {data.att ? (
          <div className="mb-6 text-sm">
            <span className="font-bold text-emerald-700">Present: {data.att.present} / {data.students.length}</span>
            <span className="mx-3 text-slate-300">|</span>
            <span className="font-bold text-red-700">Absent: {absent.length} / {data.students.length}</span>
            {absent.length > 0 && <div className="mt-2 text-slate-600">Absent: {absent.map((s) => s.name).join(", ")}</div>}
          </div>
        ) : <EmptyState text="Attendance not marked for this date." />}

        <h3 className="font-bold text-base mb-3 pb-2 border-b-2 border-slate-100">3. Flags ({data.alerts.length})</h3>
        {data.alerts.length ? (
          <ol className="list-decimal ml-5 text-sm space-y-1.5 mb-6">
            {data.alerts.map((a) => <li key={a.id}>{a.text}</li>)}
          </ol>
        ) : <div className="text-sm text-emerald-700 font-semibold mb-6">No flags — all records consistent.</div>}

        <h3 className="font-bold text-base mb-3 pb-2 border-b-2 border-slate-100">4. Repeat Offenders (by flag count)</h3>
        {offenders.length ? (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500"><th className="py-2">Student</th><th className="py-2">Flags</th></tr></thead>
            <tbody>{offenders.map(([sid, n]) => (
              <tr key={sid} className="border-t border-slate-100">
                <td className="py-2.5">{byId[sid]?.name} ({byId[sid]?.rollNo})</td>
                <td className="py-2.5"><Pill color="red">{n}</Pill></td>
              </tr>))}
            </tbody>
          </table>
        ) : <div className="text-sm text-slate-400">No repeat offenders.</div>}
      </div>
    </div>
  );
}
