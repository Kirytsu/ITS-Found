"use client";
/**
 * src/components/ui/TopNavbar.tsx
 *
 * Nav structure (3 sections):
 *   Section 1 — (unlabeled): Dashboard
 *   Section 2 — "Laporan": Kehilangan | Penemuan | Laporan Saya
 *   Section 3 — "Lapor": Lapor Kehilangan | Lapor Penemuan
 *   Section 4 — bottom: Pengaturan | Keluar
 *
 * All icons are monochrome gray — teal ONLY for active state.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu, X, LayoutDashboard, List, Search,
  PackageOpen, ClipboardList, Settings, LogOut,
  PlusCircle, ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { logoutUser } from "@/lib/actions/auth.actions";

/* ─────────────── Types ─────────────────────────────────────────────────────── */
interface NavSection {
  label?: string;           // section header label (optional)
  items: NavItemConfig[];
}

interface NavItemConfig {
  href: string;
  label: string;
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
        { href: "/",      label: "Dashboard",  icon: LayoutDashboard },
        ...(isAdmin
          ? [{ href: "/admin/verification", label: "Verifikasi Laporan", icon: ShieldCheck }]
          : []),
      ],
    },
    {
      // Section 2: Laporan
      label: "Laporan",
      items: [
        { href: "/lost",        label: "Kehilangan",   icon: Search },
        { href: "/found",       label: "Penemuan",     icon: PackageOpen },
        { href: "/my-reports",  label: "Laporan Saya", icon: ClipboardList },
      ],
    },
    {
      // Section 3: Lapor (create)
      label: "Lapor",
      items: [
        { href: "/report/new?type=lost",  label: "Lapor Kehilangan", icon: PlusCircle },
        { href: "/report/new?type=found", label: "Lapor Penemuan",   icon: PlusCircle },
      ],
    },
  ];
}

/* ─────────────── NavLink ────────────────────────────────────────────────────── */
function NavLink({ item, onClose }: { item: NavItemConfig; onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        isActive
          ? "bg-teal-50 text-teal-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {/* Icon always monochrome — teal only when active */}
      <Icon
        size={18}
        className={isActive ? "text-teal-600" : "text-gray-400"}
        strokeWidth={isActive ? 2.5 : 2}
      />
      {item.label}
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
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100 flex-shrink-0">
        <p className="text-lg font-bold tracking-tight text-gray-900 select-none">ITS Found</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {userName ? `Halo, ${userName}` : "Sistem Penemuan Barang ITS"}
        </p>
        {unreadCount > 0 && (
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
            {unreadCount} notifikasi belum dibaca
          </span>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-4 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={si} className="flex flex-col gap-0.5">
            {section.label && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} onClose={onClose} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: Pengaturan + Keluar */}
      <div className="px-2 pb-4 pt-3 border-t border-gray-100 flex-shrink-0 flex flex-col gap-0.5">
        <NavLink
          item={{ href: "/settings", label: "Pengaturan", icon: Settings }}
          onClose={onClose}
        />
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut size={18} className="text-gray-400" strokeWidth={2} />
          Keluar
        </button>
      </div>
    </div>
  );
}

/* ─────────────── TopNavbar ─────────────────────────────────────────────────── */
export default function TopNavbar({ unreadCount = 0, userName, isAdmin }: TopNavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const sections = buildSections(isAdmin);

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const sidebarProps = { sections, userName, unreadCount, onLogout: handleLogout };

  return (
    <>
      {/* ══ MOBILE: Fixed top bar ════════════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>

        <span className="text-base font-bold text-gray-900 tracking-tight">ITS Found</span>

        {/* Avatar with notif dot */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-sm font-bold select-none">
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
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
