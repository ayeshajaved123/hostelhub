import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth, can } from "../context/AuthContext.jsx";
import { todayStr } from "../utils/logic.js";

const NAV = [
  { to: "/", label: "Dashboard", roles: ["warden"], icon: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" },
  { to: "/students", label: "Students", roles: ["warden", "cr"], icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { to: "/permissions", label: "Permissions", roles: ["warden", "cr", "student"], icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15l2 2 4-4" },
  { to: "/gate", label: "Gate Log", roles: ["warden", "guard"], icon: "M3 21V10l9-7 9 7v11M9 21v-6h6v6" },
  { to: "/attendance", label: "Night Attendance", roles: ["warden", "cr"], icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { to: "/inbox", label: "Inbox", roles: ["warden"], icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" },
  { to: "/reports", label: "Reports", roles: ["warden", "cr"], icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8" },
  { to: "/roles", label: "Roles", roles: ["warden"], icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }
];

function Icon({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function Layout() {
  const { user, logout, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV.filter((n) => n.roles.includes(user?.role));
  const titles = { "/": "Dashboard", "/students": "Students", "/permissions": "Permission Slips", "/gate": "Gate Register", "/attendance": "Night Attendance", "/inbox": "Warden Inbox", "/reports": "Daily Reports", "/roles": "Roles & CR Management" };

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-slate-900 text-slate-300 flex-none flex flex-col sticky top-0 h-screen no-print">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="text-white text-lg font-extrabold tracking-tight">Hostel<span className="text-teal-400">Gate</span></h1>
          <p className="text-[10px] text-slate-500 tracking-[0.2em] mt-0.5">MOVEMENT & ATTENDANCE</p>
        </div>
        <nav className="p-2.5 flex-1">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold mb-0.5 ${isActive ? "bg-teal-700 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
              <Icon d={n.icon} /><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-slate-500">
          <div className="text-slate-300 font-bold">{user?.name}</div>
          <div className="capitalize">{user?.role}{isDemo ? " · demo" : ""}</div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-7 py-4 flex justify-between items-center sticky top-0 z-10 no-print">
          <h2 className="text-xl font-bold tracking-tight">{titles[location.pathname] || "HostelHub"}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
            <button onClick={() => { logout(); navigate("/login"); }} className="text-sm font-bold text-slate-500 hover:text-slate-800">Log out</button>
          </div>
        </header>
        <main className="p-6 md:p-7 max-w-6xl w-full mx-auto"><Outlet /></main>
      </div>
    </div>
  );
}

export function useToday() { return todayStr(); }
