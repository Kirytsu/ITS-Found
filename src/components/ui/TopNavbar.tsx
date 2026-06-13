"use client";
/**
 * src/components/ui/TopNavbar.tsx
 *
 * Nav structure (3 sections):
 * Section 1 — (unlabeled): Dashboard
 * Section 2 — "Laporan": Kehilangan | Penemuan | Laporan Saya
 * Section 3 — "Lapor": Lapor Kehilangan | Lapor Penemuan
 * Section 4 — bottom: Profil | Notifikasi | Pengaturan | Keluar
 *
 * All icons are monochrome gray — brand navy ONLY for active state.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu, X, LayoutDashboard, Search,
  PackageOpen, ClipboardList, Settings, LogOut,
  PlusCircle, ShieldCheck, User, Bell,
} from "lucide-react";
import { clsx } from "clsx";
import { logoutUser } from "@/lib/actions/auth.actions";
import BrandMark from "@/components/ui/BrandMark";
import { useT } from "@/components/shared/LanguageProvider";

/* ─────────────── Types ─────────────────────────────────────────────────────── */
interface NavSection {
  labelKey?: string;        // section header label key (optional)
  items: NavItemConfig[];
}

interface NavItemConfig {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

interface TopNavbarProps {
  unreadCount?: number;
  userName?: string;
  isAdmin?: boolean;
}

/* ─────────────── Nav Structure ─────────────────────────────────────────────── */
function buildSections(isAdmin?: boolean): NavSection[] {
  return [
    {
      // Section 1: Dashboard (no label)
      items: [
        { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
        ...(isAdmin
          ? [{ href: "/admin/verification", labelKey: "nav.verify", icon: ShieldCheck }]
          : []),
      ],
    },
    {
      // Section 2: Laporan
      labelKey: "nav.section.reports",
      items: [
        { href: "/lost", labelKey: "nav.lost", icon: Search },
        { href: "/found", labelKey: "nav.found", icon: PackageOpen },
        { href: "/my-reports", labelKey: "nav.myReports", icon: ClipboardList },
      ],
    },
    {
      // Section 3: Lapor (create)
      labelKey: "nav.section.report",
      items: [
        { href: "/report/new?type=lost", labelKey: "nav.reportLost", icon: PlusCircle },
        { href: "/report/new?type=found", labelKey: "nav.reportFound", icon: PlusCircle },
      ],
    },
  ];
}

/* ─────────────── NavLink ────────────────────────────────────────────────────── */
function NavLink({ item, onClose, badge }: { item: NavItemConfig; onClose?: () => void; badge?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useT();

  let isActive = false;
  if (item.href === "/") {
    isActive = pathname === "/";
  } else {
    const [path, query] = item.href.split("?");
    if (pathname.startsWith(path)) {
      if (query) {
        const targetType = new URLSearchParams(query).get("type");
        const currentType = searchParams.get("type");
        isActive = targetType === currentType;
      } else {
        isActive = true;
      }
    }
  }

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
        isActive
          ? "bg-brand-50 text-brand-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {/* Icon always monochrome — brand navy only when active */}
      <Icon
        size={18}
        className={isActive ? "text-brand-600" : "text-gray-400"}
        strokeWidth={isActive ? 2.5 : 2}
      />
      {t(item.labelKey)}
      {/* Badge for notifications */}
      {!!badge && badge > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
      )}
    </Link>
  );
}

/* ─────────────── SidebarContent ────────────────────────────────────────────── */
function SidebarContent({
  sections, userName, unreadCount, onClose, onLogout,
}: {
  sections: NavSection[];
  userName?: string;
  unreadCount: number;
  onClose?: () => void;
  onLogout: () => void;
}) {
  const t = useT();
  const displayCount = unreadCount;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Profile Card (Desktop) */}
      <Link href="/profile" className="hidden lg:block px-4 py-4 border-b border-gray-100 flex-shrink-0 hover:bg-gray-50 transition-colors rounded-b-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 select-none">
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t("nav.viewProfile")}</p>
          </div>
        </div>
      </Link>

      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100 flex-shrink-0">
        <BrandMark size="md" />
        <p className="text-xs text-gray-400 mt-2 truncate">
          {userName ? t("nav.greeting", { name: userName }) : t("nav.tagline")}
        </p>
        {displayCount > 0 && (
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
            {t("nav.unread", { count: displayCount })}
          </span>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-4 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={si} className="flex flex-col gap-0.5">
            {section.labelKey && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
                {t(section.labelKey)}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} onClose={onClose} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: Profil + Notifikasi + Pengaturan + Keluar */}
      <div className="px-2 pb-4 pt-3 border-t border-gray-100 flex-shrink-0 flex flex-col gap-0.5">
        <NavLink
          item={{ href: "/profile", labelKey: "nav.profile", icon: User }}
          onClose={onClose}
        />
        <NavLink
          item={{ href: "/notifications", labelKey: "nav.notifications", icon: Bell }}
          onClose={onClose}
          badge={displayCount}
        />
        <NavLink
          item={{ href: "/settings", labelKey: "nav.settings", icon: Settings }}
          onClose={onClose}
        />
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut size={18} className="text-gray-400" strokeWidth={2} />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}

/* ─────────────── TopNavbar ─────────────────────────────────────────────────── */
export default function TopNavbar({ unreadCount = 0, userName, isAdmin }: TopNavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const router = useRouter();
  const t = useT();
  const sections = buildSections(isAdmin);

  const handleLogout = async () => {
    setDrawerOpen(false);
    setProfileDropdownOpen(false);
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const sidebarProps = { sections, userName, unreadCount, onLogout: handleLogout };
  const currentDisplayCount = unreadCount;

  return (
    <>
      {/* ══ MOBILE: Fixed top bar ════════════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>

        <BrandMark size="sm" />

        {/* Avatar with notif dot - clickable profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="relative w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold select-none hover:shadow-md transition-shadow"
            aria-label={t("nav.profile")}
          >
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </button>
          {currentDisplayCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">{t("nav.registeredAs")}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                </div>
                <div className="flex flex-col py-2">
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} className="text-gray-400" />
                    {t("nav.profile")}
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 relative"
                  >
                    <Bell size={16} className="text-gray-400" />
                    {t("nav.notifications")}
                    {currentDisplayCount > 0 && (
                      <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        {currentDisplayCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings size={16} className="text-gray-400" />
                    {t("nav.settings")}
                  </Link>
                  <button
                    onClick={async () => {
                      setProfileDropdownOpen(false);
                      await logoutUser();
                      router.push("/login");
                      router.refresh();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                  >
                    <LogOut size={16} className="text-gray-400" />
                    {t("nav.logout")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ══ MOBILE: Backdrop ═════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ══ MOBILE: Slide-in Drawer ══════════════════════════════════════════ */}
      <aside
        className={clsx(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-3.5 right-3 p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
        <SidebarContent {...sidebarProps} onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* ══ DESKTOP: Permanent Left Sidebar ══════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200">
        <SidebarContent {...sidebarProps} />
      </aside>
    </>
  );
}
