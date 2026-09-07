"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/lib/auth/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/jobs", label: "Jobs", exact: false },
  { href: "/admin/jobs/new", label: "Add Job", exact: true },
  { href: "/admin/categories", label: "Categories", exact: false },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/admin" className="text-sm font-semibold text-neutral-900">
          Job Portal <span className="text-neutral-500">admin</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-nav-links"
          className="ml-auto rounded-md border border-neutral-300 px-3 py-1.5 text-sm sm:hidden"
        >
          Menu
        </button>

        <nav
          id="admin-nav-links"
          aria-label="Admin"
          className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 sm:ml-4 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-1`}
        >
          {LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-neutral-900 font-medium text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
          <span className="truncate text-sm text-neutral-500" title={email}>
            {email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
