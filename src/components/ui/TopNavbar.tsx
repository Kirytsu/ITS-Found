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
  PlusCircle, ShieldCheck, User, Bell, Sun, Moon,
} from "lucide-react";
import { clsx } from "clsx";
import { logoutUser } from "@/lib/actions/auth.actions";
import BrandMark from "@/components/ui/BrandMark";
import { useT, useLanguage } from "@/components/shared/LanguageProvider";
import { useTheme } from "@/components/shared/ThemeProvider";

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

      {/* Bottom section */}
      <div className="px-2 pb-4 pt-3 border-t border-gray-100 shrink-0 flex flex-col gap-0.5">
        {/* Mobile only: profile card + icon logout + notifications + settings */}
        <div className="lg:hidden flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex flex-1 items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                {userName ? userName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">{userName ?? "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{t("nav.viewProfile")}</p>
              </div>
            </Link>
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors shrink-0"
              aria-label={t("nav.logout")}
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          </div>
          <NavLink item={{ href: "/notifications", labelKey: "nav.notifications", icon: Bell }} onClose={onClose} badge={displayCount} />
          <NavLink item={{ href: "/settings", labelKey: "nav.settings", icon: Settings }} onClose={onClose} />
        </div>

        {/* Desktop only: full-width logout button */}
        <button
          onClick={onLogout}
          className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
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
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const sections = buildSections(isAdmin);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleLocale = () => {
    const next = locale === "id" ? "en" : "id";
    setLocale(next);
    router.refresh();
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    setProfileDropdownOpen(false);
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const sidebarProps = { sections, userName, unreadCount, onLogout: handleLogout };
  const currentDisplayCount = unreadCount;
  const pathname = usePathname();

  return (
    <>
      {/* ══ DESKTOP: Fixed top header (right of sidebar) ═════════════════════ */}
      {/* Transparent — gray-50 = dark page bg, so border-gray-200/20 stays subtle in both modes */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 h-14 bg-transparent border-b border-gray-200/30 items-center justify-between px-6">
        {/* Left: theme + language toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-200"
            aria-label={theme === "dark" ? t("settings.theme.light") : t("settings.theme.dark")}
          >
            {theme === "dark" ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
          <button
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-xl transition-colors text-xs font-bold tracking-wide text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-200"
            aria-label="Switch language"
          >
            {locale === "id" ? "ID" : "EN"}
          </button>
        </div>

        {/* Right: notifications + settings + profile */}
        <div className="flex items-center gap-1">
        {/* Notifications */}
        {/* dark: gray-200=#27272a (hover), brand-100=#14254d (active), brand-600=#7aa0f5 (text) */}
        <Link
          href="/notifications"
          className={clsx(
            "relative p-2.5 rounded-xl transition-colors",
            pathname === "/notifications"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-100/50 dark:text-brand-600"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-200"
          )}
          aria-label={t("nav.notifications")}
        >
          <Bell size={20} strokeWidth={pathname === "/notifications" ? 2.5 : 2} />
          {currentDisplayCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {currentDisplayCount > 99 ? "99+" : currentDisplayCount}
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className={clsx(
            "p-2.5 rounded-xl transition-colors",
            pathname === "/settings"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-100/50 dark:text-brand-600"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-200"
          )}
          aria-label={t("nav.settings")}
        >
          <Settings size={20} strokeWidth={pathname === "/settings" ? 2.5 : 2} />
        </Link>

        {/* Divider — gray-300 dark = #3f3f46 */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-300 mx-1" />

        {/* Profile — gray-700 dark = #e4e4e7 (legible text on dark) */}
        <Link
          href="/profile"
          className={clsx(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors",
            pathname === "/profile"
              ? "bg-brand-50 dark:bg-brand-100/50"
              : "hover:bg-gray-100 dark:hover:bg-gray-200"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </div>
          <span className={clsx(
            "text-sm font-semibold max-w-[140px] truncate",
            pathname === "/profile" ? "text-brand-700 dark:text-brand-600" : "text-gray-700 dark:text-gray-700"
          )}>
            {userName ?? "—"}
          </span>
        </Link>
        </div>{/* end right section */}
      </header>

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
