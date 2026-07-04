"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav-config";

export function Sidebar({ items, roleLabel }: { items: NavItem[]; roleLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-parchment-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-parchment-200 px-6">
        <Link href="/" className="font-display text-lg font-semibold text-brand-800">
          Sakeenah <span className="italic text-gold-600">Academy</span>
        </Link>
      </div>

      <p className="px-6 pt-5 text-xs font-semibold uppercase tracking-wider text-parchment-400">
        {roleLabel}
      </p>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-800"
                  : "text-parchment-600 hover:bg-parchment-100 hover:text-parchment-900"
              }`}
            >
              <span className={active ? "text-brand-700" : "text-parchment-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
