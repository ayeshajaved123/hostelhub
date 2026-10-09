import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Field, inputCls, Btn } from "../components/ui.jsx";

const ROLES = [
  { id: "warden", label: "Warden", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "guard", label: "Guard", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { id: "cr", label: "CR", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { id: "student", label: "Student", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" }
];

export default function Login() {
  const { loginDemo, login, isDemo } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("warden");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (isDemo) {
        loginDemo(role);
      } else {
        if (!email || !password) { setErr("Email and password are required."); return; }
        await login(email, password);
      }
      navigate("/");
    } catch (ex) {
      setErr("Sign in failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Hostel<span className="text-teal-600">Hub</span></h1>
          <p className="text-xs text-slate-500 tracking-widest mt-1">HOSTEL MOVEMENT & ATTENDANCE</p>
          <p className="text-sm text-slate-500 mt-3">Sign in to your account</p>
        </div>
        {isDemo && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {ROLES.map((r) => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 text-xs font-bold ${role === r.id ? "border-teal-700 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={r.icon} /></svg>
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
        <form onSubmit={submit}>
          {!isDemo && (
            <>
              <Field label="Email address"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hostelhub.pk" /></Field>
              <Field label="Password"><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Field>
            </>
          )}
          {err && <div className="text-red-600 text-sm font-semibold mb-4">{err}</div>}
          <Btn type="submit" className="w-full justify-center">Sign In{isDemo ? ` as ${role}` : ""}</Btn>
        </form>
        {isDemo && <p className="text-center text-xs text-slate-400 mt-4">Demo mode — connect Firebase for real authentication.</p>}
      </div>
    </div>
  );
}
