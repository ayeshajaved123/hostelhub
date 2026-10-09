import { initials } from "../utils/logic.js";

const pillStyles = {
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  teal: "bg-teal-100 text-teal-800",
  gray: "bg-slate-100 text-slate-500"
};

export function Pill({ children, color = "gray" }) {
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${pillStyles[color] || pillStyles.gray}`}>
      {children}
    </span>
  );
}

export function CatPill({ category }) {
  return category === "self" ? <Pill color="teal">Self</Pill> : <Pill color="blue">Guardian</Pill>;
}

export function RolePill({ role }) {
  const map = { warden: "red", guard: "amber", cr: "blue", student: "gray" };
  const label = { warden: "Warden", guard: "Guard", cr: "CR", student: "Student" };
  return <Pill color={map[role] || "gray"}>{label[role] || role}</Pill>;
}

export function StatCard({ label, value, color = "teal", sub, onClick }) {
  const colors = { teal: "text-teal-700", red: "text-red-600", amber: "text-amber-600", green: "text-emerald-600", blue: "text-blue-600" };
  return (
    <div onClick={onClick} className={`bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm ${onClick ? "cursor-pointer hover:border-teal-600" : ""}`}>
      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-extrabold tracking-tight ${colors[color]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export function Avatar({ name, size = 44 }) {
  return (
    <div className="rounded-full bg-teal-700 text-white font-extrabold flex items-center justify-center flex-none"
      style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name || "?")}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} shadow-2xl max-h-[92vh] overflow-y-auto`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-700 bg-white";

export function Btn({ children, variant = "primary", size, ...rest }) {
  const v = {
    primary: "bg-teal-700 hover:bg-teal-800 text-white",
    ghost: "bg-white border border-slate-200 hover:border-slate-400 text-slate-800",
    danger: "bg-red-100 hover:bg-red-200 text-red-700",
    dark: "bg-slate-900 hover:bg-slate-800 text-white"
  };
  const s = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  return <button className={`inline-flex items-center gap-2 rounded-lg font-bold ${s} ${v[variant]}`} {...rest}>{children}</button>;
}

export function EmptyState({ text }) {
  return <div className="py-10 text-center text-slate-400 text-sm">{text}</div>;
}

export function FlagCard({ text, time }) {
  return (
    <div className="bg-red-50/60 border border-red-200 border-l-4 border-l-red-600 rounded-xl px-4 py-3 mb-2.5 text-sm">
      <span className="font-extrabold text-red-700">FLAG</span> — {text}
      {time && <div className="text-xs text-slate-500 mt-1">{time}</div>}
    </div>
  );
}
