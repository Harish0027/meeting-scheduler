"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Settings,
  User,
  Menu,
  HelpCircle,
  FileText,
  Clock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  /* ---------------- Click outside handling ---------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- App routes only ---------------- */
  const isAppRoute = [
    "/dashboard",
    "/event-types",
    "/bookings",
    "/availability",
    "/settings",
  ].some((route) => pathname?.startsWith(route));

  if (!isAppRoute) return null;

  /* ---------------- Logout ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ---------------- Logo ---------------- */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
              Cal
            </div>
            <span className="hidden sm:inline text-sm font-semibold">
              Cal.com
            </span>
          </Link>

          {/* ---------------- Desktop Nav ---------------- */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink
              href="/dashboard"
              active={pathname?.startsWith("/dashboard")}
            >
              Dashboard
            </NavLink>
            <NavLink
              href="/event-types"
              active={pathname?.startsWith("/event-types")}
            >
              Event Types
            </NavLink>
            <NavLink
              href="/bookings"
              active={pathname?.startsWith("/bookings")}
            >
              Bookings
            </NavLink>
            <NavLink
              href="/availability"
              active={pathname?.startsWith("/availability")}
            >
              Availability
            </NavLink>
          </div>

          {/* ---------------- Mobile Menu ---------------- */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-lg hover:bg-neutral-100"
            >
              <Menu className="w-6 h-6 text-neutral-700" />
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg py-1">
                <MobileItem
                  icon={User}
                  label="My profile"
                  href="/settings/profile"
                  close={() => setMobileMenuOpen(false)}
                />
                <MobileItem
                  icon={Settings}
                  label="My settings"
                  href="/settings"
                  close={() => setMobileMenuOpen(false)}
                />
                <MobileItem
                  icon={Clock}
                  label="Out of office"
                  href="/out-of-office"
                  close={() => setMobileMenuOpen(false)}
                />

                <hr className="my-1" />

                <MobileItem
                  icon={FileText}
                  label="Roadmap"
                  href="/roadmap"
                  close={() => setMobileMenuOpen(false)}
                />
                <MobileItem
                  icon={HelpCircle}
                  label="Help"
                  href="/help"
                  close={() => setMobileMenuOpen(false)}
                />

                <hr className="my-1" />

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* ---------------- Desktop User Menu ---------------- */}
          <div className="hidden md:block relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-2 rounded-full hover:bg-neutral-100"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                H
              </div>
              <span className="text-sm">Harish</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-1">
                <Link
                  href="/settings/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100"
                >
                  <User className="w-4 h-4" />
                  My profile
                </Link>

                <hr className="my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- Reusable Components ---------------- */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active ? "text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileItem({
  icon: Icon,
  label,
  href,
  close,
}: {
  icon: any;
  label: string;
  href: string;
  close: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={close}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
