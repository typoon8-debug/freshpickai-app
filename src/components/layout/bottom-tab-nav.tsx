"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Users, ListTodo, ShoppingCart } from "lucide-react";

const TABS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/chat", icon: MessageCircle, label: "AI" },
  { href: "/family", icon: Users, label: "가족" },
  { href: "/memo", icon: ListTodo, label: "메모" },
  { href: "/cart", icon: ShoppingCart, label: "장바구니" },
];

export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-paper border-line fixed right-0 bottom-0 left-0 flex h-16 items-center border-t">
      {TABS.map(({ href, icon: Icon, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
              isActive ? "text-mocha-700" : "text-ink-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
