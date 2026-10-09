import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { store } from "../data/store.js";
import { todayStr } from "../utils/logic.js";
import { Pill, CatPill, Avatar, EmptyState, FlagCard, Btn } from "../components/ui.jsx";

function KV({ k, v }) {
  return (
    <div className="py-2 border-b border-dashed border-slate-200">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{k}</div>
      <div className="font-semibold">{v || "—"}</div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [moves, setMoves] = useState([]);
  const [atts, setAtts] = useState([]);
  const [flags, setFlags] = useState([]);
  const [tab, setTab] = useState("info");
  const t = todayStr();

  useEffect(() => { load(); }, [id]);
  async function load() {
    const students = await store.getStudents();
    const s = students.find((x) => x.id === id);
    setStudent(s);
    if (!s) return;
    const gate = await store.getGateLog(t);
    // movement across demo: also pull any stored gate entries (demo keeps today only; fine)
    setMoves(gate.filter((g) => g.studentId === id).sort((a, b) => (a.exitTime < b.exitTime ? 1 : -1)));
    const att = await store.getAttendance(t);
    setAtts(att && att.records[id] ? [{ date: t, mark: att.records[id] }] : []);
    const alerts = await store.getAlerts();
    setFlags(alerts.filter((a) => a.studentId === id));
  }

  if (!student) return <EmptyState text="Student not found." />;
  const out = moves.some((g) => g.date === t && g.exitTime && !g.entryTime);

  return (
    <div>
      <Link to="/students" className="text-sm font-bold text-teal-700 mb-4 inline-block">← Back to Students</Link>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={student.name} size={76} />
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">{student.name}</h2>
            <div className="text-sm text-slate-500 mt-0.5">{student.rollNo} · Room {student.room || "—"}</div>
            <div className="flex gap-2 mt-2">
              <CatPill category={student.category} />
              {student.role === "cr" && <Pill color="blue">CR</Pill>}
              {out ? <Pill color="amber">Currently Outside</Pill> : <Pill color="green">Inside Hostel</Pill>}
            </div>
          </div>
        </div>
        <div className="flex gap-1 border-b border-slate-200 mb-4">
          {["info", "movement", "attendance", "flags"].map((x) => (
            <button key={x} onClick={() => setTab(x)}
              className={`px-4 py-2.5 text-sm font-bold capitalize border-b-2 -mb-px ${tab === x ? "text-teal-700 border-teal-700" : "text-slate-400 border-transparent"}`}>
              {x === "info" ? "Info" : x === "movement" ? `Movement (${moves.length})` : x === "attendance" ? "Attendance" : `Flags (${flags.length})`}
            </button>
          ))}
        </div>

        {tab === "info" && (
          <div className="grid md:grid-cols-2 gap-x-8">
            <KV k="Phone" v={student.phone} />
            <KV k="Department" v={student.department} />
            <KV k="Room No" v={student.room} />
            <KV k="Category" v={student.category === "self" ? "Self — may go out alone" : "Guardian — only with guardian"} />
            <KV k="Guardian Name" v={student.guardianName} />
            <KV k="Guardian Phone" v={student.guardianPhone} />
            <KV k="Home Emergency Number" v={student.homePhone} />
            <KV k="Medical Notes" v={student.medical} />
          </div>
        )}
        {tab === "movement" && (
          moves.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-2">Date</th><th className="py-2">Exit</th><th className="py-2">Accompanied By</th><th className="py-2">Return</th><th className="py-2">Received By</th>
              </tr></thead>
              <tbody>{moves.map((g) => (
                <tr key={g.id} className="border-t border-slate-100">
                  <td className="py-2.5">{g.date}</td><td className="py-2.5">{g.exitTime}</td>
                  <td className="py-2.5">{g.accompaniedBy}</td>
                  <td className="py-2.5">{g.entryTime || <Pill color="amber">Out</Pill>}</td>
                  <td className="py-2.5">{g.receivedBy || "—"}</td>
                </tr>))}
              </tbody>
            </table>
          ) : <EmptyState text="No gate movements recorded." />
        )}
        {tab === "attendance" && (
          atts.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500"><th className="py-2">Date</th><th className="py-2">Status</th></tr></thead>
              <tbody>{atts.map((a) => (
                <tr key={a.date} className="border-t border-slate-100">
                  <td className="py-2.5">{a.date}</td>
                  <td className="py-2.5">{a.mark === "present" ? <Pill color="green">Present</Pill> : <Pill color="red">Absent</Pill>}</td>
                </tr>))}
              </tbody>
            </table>
          ) : <EmptyState text="No attendance records yet." />
        )}
        {tab === "flags" && (
          flags.length ? flags.map((f) => <FlagCard key={f.id} text={f.text} time={`${f.date} ${f.time || ""}`} />)
            : <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-semibold">No flags against this student.</div>
        )}
      </div>
    </div>
  );
}
