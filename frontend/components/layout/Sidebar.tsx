"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Boxes, CalendarPlus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/helpers";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/sections", label: "Sections", icon: Boxes },
  { href: "/schedule/generate", label: "Generate Schedule", icon: CalendarPlus },
  { href: "/schedule/view", label: "View Schedule", icon: CalendarDays },
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "w-64 shrink-0 border-r bg-white h-screen p-4",
        // Desktop: sticky sidebar
        "md:sticky md:top-0",
        // Mobile: fixed drawer when open
        open ? "fixed left-0 top-0 z-50 shadow-lg" : "hidden md:block"
      )}
      onClick={(e) => {
        // allow clicking inside without closing
        e.stopPropagation();
      }}
    >
      <div className="text-lg font-semibold mb-6">Routine Generator</div>
      <nav className="space-y-1">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition",
                active && "bg-gray-100 font-medium"
              )}
              onClick={onClose}
            >
              <Icon size={18} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
