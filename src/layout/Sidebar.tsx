import { NavLink } from "react-router-dom";
import { LayoutDashboard, Cpu, LineChart } from "lucide-react";

const link =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-text hover:bg-white/5 transition";

export default function Sidebar() {
  return (
    <aside className="h-full md:h-full w-full md:w-64 shrink-0 border border-[color:var(--border)] md:border-r md:border-[color:var(--border)] bg-panel p-3 rounded-xl md:rounded-none">
      <nav className="space-y-1">
        <NavLink to="/" end className={link}>
          <LayoutDashboard size={18}/> Dashboard
        </NavLink>
        <NavLink to="/devices" className={link}>
          <Cpu size={18}/> Devices
        </NavLink>
        <NavLink to="/analytics" className={link}>
          <LineChart size={18}/> Analytics
        </NavLink>
      </nav>
    </aside>
  );
}
