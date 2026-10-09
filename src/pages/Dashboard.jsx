import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../data/store.js";
import { todayStr, nowTime, detectLate } from "../utils/logic.js";
import { StatCard, Pill, Btn, EmptyState, FlagCard, CatPill } from "../components/ui.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], permissions: [], gate: [], alerts: [] });
  const t = todayStr();

  useEffect(() => { load(); }, []);
  async function load() {
    const [students, permissions, gate, alerts] = await Promise.all([
      store.getStudents(), store.getPermissions(), store.getGateLog(t), store.getAlerts()
    ]);
    // Late-return detection (runs on dashboard view)
    const fresh = detectLate(t, nowTime(), gate, students, permissions);
    for (const a of fresh) {
      const dup = alerts.some((x) => x.studentId === a.studentId && x.type === "late" && x.date === t && !x.acknowledged);
      if (!dup) { await store.saveAlert(a); alerts.unshift(a); }
    }
    setData({ students, permissions, gate, alerts });
  }

  const byId = Object.fromEntries(data.students.map((s) => [s.id, s]));
  const outside = data.gate.filter((g) => g.exitTime && !g.entryTime);
  const pendPerms = data.permissions.filter((p) => p.status === "pending");
  const todayAlerts = data.alerts.filter((a) => a.date === t && !a.acknowledged);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={data.students.length} color="teal" sub="Registered residents" onClick={() => navigate("/students")} />
        <StatCard label="Currently Outside" value={outside.length} color="amber" sub="Students out of hostel" onClick={() => navigate("/gate")} />
        <StatCard label="Pending Permissions" value={pendPerms.length} color="blue" sub="Awaiting approval" onClick={() => navigate("/permissions")} />
        <StatCard label="Flags Today" value={todayAlerts.length} color="red" sub="Require attention" onClick={() => navigate("/inbox")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-200">
          <h3 className="font-bold text-red-700">Flags Requiring Attention</h3>
          <button onClick={() => navigate("/inbox")} className="text-sm font-bold text-teal-700">View All →</button>
        </div>
        <div className="p-5">
          {todayAlerts.length ? todayAlerts.slice(0, 4).map((a) => (
            <FlagCard key={a.id} text={a.text} time={`${a.date} ${a.time}`} />
          )) : <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-semibold">All clear — no flags today.</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-200">
            <h3 className="font-bold">Currently Outside</h3>
            <button onClick={() => navigate("/gate")} className="text-sm font-bold text-teal-700">View All →</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-2.5">Student</th><th className="px-3 py-2.5">Exit</th><th className="px-3 py-2.5">With</th>
            </tr></thead>
            <tbody>
              {outside.slice(0, 6).map((g) => (
                <tr key={g.id} className="border-t border-slate-100">
                  <td className="px-5 py-2.5 font-semibold">{byId[g.studentId]?.name}<div className="text-xs text-slate-400 font-normal">{byId[g.studentId]?.rollNo}</div></td>
                  <td className="px-3 py-2.5">{g.exitTime}</td>
                  <td className="px-3 py-2.5">{g.accompaniedBy}</td>
                </tr>
              ))}
              {!outside.length && <tr><td colSpan="3"><EmptyState text="Everyone is inside the hostel." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-200">
            <h3 className="font-bold">Pending Permissions</h3>
            <button onClick={() => navigate("/permissions")} className="text-sm font-bold text-teal-700">View All →</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-2.5">Student</th><th className="px-3 py-2.5">Purpose</th><th className="px-3 py-2.5">Actions</th>
            </tr></thead>
            <tbody>
              {pendPerms.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-5 py-2.5 font-semibold">{byId[p.studentId]?.name}</td>
                  <td className="px-3 py-2.5">{p.purpose}</td>
                  <td className="px-3 py-2.5"><Btn size="sm" onClick={() => navigate("/permissions")}>Review</Btn></td>
                </tr>
              ))}
              {!pendPerms.length && <tr><td colSpan="3"><EmptyState text="No pending slips." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
