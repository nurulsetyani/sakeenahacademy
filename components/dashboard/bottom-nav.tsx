"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav-config";

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-parchment-200 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <span className={active ? "text-brand-700" : "text-parchment-400"}>{item.icon}</span>
              <span className={active ? "text-brand-800" : "text-parchment-500"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
