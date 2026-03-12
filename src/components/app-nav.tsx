"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { useAuth } from "@/components/providers";

export function AppNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: "/feed", label: "Feed" },
    { href: "/map", label: "Map" },
    { href: "/search", label: "Search" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        <Link href="/feed" className="text-sm font-medium text-stone-900">
          Restaurant Journal
        </Link>
        <nav className="flex items-center gap-0.5">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-2.5 py-1.5 text-sm ${
                pathname === href
                  ? "bg-brand-100 text-brand-800"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user?.profile_photo ? (
            <img
              src={user.profile_photo}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-200 text-xs font-medium text-brand-800">
              {user?.name?.[0] ?? "?"}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
