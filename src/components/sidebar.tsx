"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Search,
  Database,
  CheckCircle2,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/toast";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/leads/new", label: "Lead Discovery", icon: Search },
  { href: "/leads", label: "Lead Inventory", icon: Database },
  { href: "/leads/qualified", label: "Qualified Leads", icon: CheckCircle2 },
  { href: "/buyers", label: "Buyers", icon: Users },
  { href: "/sales", label: "Lead Sales", icon: DollarSign },
  { href: "/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/exports", label: "Exports", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 h-screen sticky top-0 flex-col bg-slate-950 border-r border-slate-800 text-slate-300">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="text-lg font-semibold text-white">Lead Intel</div>
        <div className="text-xs text-slate-500">Internal workspace</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                active
                  ? "bg-slate-800 text-white border-l-2 border-blue-500"
                  : "hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-5 py-3 text-sm border-t border-slate-800 hover:bg-slate-900 hover:text-white transition"
      >
        <LogOut size={16} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}