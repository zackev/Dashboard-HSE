import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  Wrench,
  Activity,
  FileCheck2,
  Target,
  FileText,
} from "lucide-react";
import { NAV_GROUPS } from "../config/modules.jsx";

const ICONS = {
  dashboard: LayoutDashboard,
  incidents: AlertTriangle,
  inspections: ClipboardCheck,
  trainings: GraduationCap,
  capa: Wrench,
  hse_performance: Activity,
  permits: FileCheck2,
  kpis: Target,
  documents: FileText,
};

export default function Sidebar({ counts }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[250px] flex-col bg-gradient-to-b from-[#171c21] to-bg px-3.5 py-5 max-md:static max-md:h-auto max-md:w-full">
      <div className="hazard-divider mb-4 flex items-center gap-2.5 border-b-[3px] pb-5">
        <div className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px] bg-gradient-to-br from-brand-orange to-brand-yellow" />
        <div>
          <span className="block text-[15px] font-extrabold tracking-wide">
            HSE COMMAND
          </span>
          <span className="block text-[10.5px] text-muted">
            Health &middot; Safety &middot; Environment
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 max-md:flex-row max-md:flex-wrap">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <div className="px-3 pb-1 pt-3.5 text-[10px] font-extrabold uppercase tracking-wide text-muted opacity-70">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = ICONS[item.key];
              const to =
                item.key === "dashboard"
                  ? "/"
                  : `/${item.key.replace("_", "-")}`;
              return (
                <NavLink
                  key={item.key}
                  to={to}
                  end={item.key === "dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition ${
                      isActive
                        ? "bg-brand-orangedim text-brand-yellow"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.key !== "dashboard" && (
                    <span className="ml-auto rounded-full bg-surface2 px-1.5 py-px text-[11px] font-bold text-muted">
                      {counts[item.key] ?? 0}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* <div className="mt-2.5 flex items-center gap-2.5 border-t border-border pt-3.5 max-md:hidden">
        <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-good" />
        <div>
          <div className="text-xs font-bold">React + Vite Demo</div>
          <div className="text-[10.5px] text-muted">Data tersimpan lifetime &middot; siap migrasi ke Laravel</div>
        </div>
      </div> */}
    </aside>
  );
}
