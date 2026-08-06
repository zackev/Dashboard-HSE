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
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { NAV_GROUPS } from "../config/modules.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

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
  settings: SettingsIcon,
};

export default function Sidebar({ counts }) {
  const { user, hasPermission, logout } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] flex-col bg-sidebar to-bg px-3.5 py-5 max-md:static max-md:h-auto max-md:w-full">
      <div className="hazard-divider mb-4 flex items-center justify-between gap-2.5 border-b-[3px] pb-5 border-[#2B333C]">
        <div className="flex items-center gap-2.5">
          <div className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px] bg-gradient-to-br from-brand-orange to-brand-yellow" />
          <div>
            <span className="block text-[15px] font-extrabold tracking-wide text-white">
              HSE COMMAND
            </span>
            <span className="block text-[10.5px] text-[#8D98A3]">
              Health &middot; Safety &middot; Environment
            </span>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex flex-1 flex-col gap-1 max-md:flex-row max-md:flex-wrap">
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(
            (item) =>
              hasPermission(item.permission) ||
              (item.altPermission && hasPermission(item.altPermission)),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={gi}>
              {group.title && (
                <div className="px-3 pb-1 pt-3.5 text-[10px] font-extrabold uppercase tracking-wide text-[#8D98A3] opacity-70">
                  {group.title}
                </div>
              )}

              {visibleItems.map((item) => {
                const Icon = ICONS[item.key];
                const to =
                  item.key === "dashboard"
                    ? "/"
                    : `/${item.key.replace("_", "-")}`;

                const showCount =
                  item.key !== "dashboard" &&
                  item.key !== "settings" &&
                  counts[item.key] !== undefined;

                return (
                  <NavLink
                    key={item.key}
                    to={to}
                    end={item.key === "dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition ${
                        isActive
                          ? "bg-brand-orangedim text-brand-yellow"
                          : "text-[#8D98A3] hover:bg-[#222932] hover:text-white"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>

                    {showCount && (
                      <span className="ml-auto rounded-full bg-[#222932] px-1.5 py-px text-[11px] font-bold text-[#8D98A3]">
                        {counts[item.key] ?? 0}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="mt-2.5 flex flex-col gap-2.5 border-t border-[#2B333C] pt-3.5">
        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#222932] text-xs font-bold text-white">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-white">
                {user.name}
              </div>

              <div className="truncate text-[10.5px] text-[#8D98A3]">
                {user.role?.name}
              </div>
            </div>

            <button className="btn-icon" title="Keluar" onClick={logout}>
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
