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
    <aside
      className="sticky top-0 flex h-screen w-[250px] flex-col
      bg-[#1F3B5C] border-r border-[#29496d]
      px-3.5 py-5
      text-white
      max-md:static max-md:h-auto max-md:w-full"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange shadow-md">
          <Activity size={20} className="text-white" />
        </div>

        <div>
          <span className="block text-[15px] font-extrabold tracking-wide text-white">
            HSE COMMAND
          </span>

          <span className="block text-[10.5px] text-blue-100">
            Health &middot; Safety &middot; Environment
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 max-md:flex-row max-md:flex-wrap">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <div className="px-3 pb-1 pt-3.5 text-[10px] font-extrabold uppercase tracking-wide text-blue-200/70">
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
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow"
                        : "text-blue-100 hover:bg-[#2B4F78] hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />

                  <span>{item.label}</span>

                  {item.key !== "dashboard" && (
                    <span
                      className="
                      ml-auto
                      rounded-full
                      bg-white/15
                      px-2
                      py-0.5
                      text-[11px]
                      font-bold
                      text-white
                      "
                    >
                      {counts[item.key] ?? 0}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/*
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="text-xs font-semibold text-white">
          HSE Dashboard
        </div>
        <div className="text-[11px] text-blue-200">
          React + Vite + Express
        </div>
      </div>
      */}
    </aside>
  );
}
