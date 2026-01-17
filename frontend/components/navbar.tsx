"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAppRoute = [
    "/dashboard",
    "/event-types",
    "/bookings",
    "/availability",
  ].some((route) => pathname?.startsWith(route));

  if (!isAppRoute) return null;

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    // Clear cookie by setting it to expire
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to home
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
              Cal
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-neutral-900">
              Cal.com
            </span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith("/dashboard")
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/event-types"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith("/event-types")
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Event Types
            </Link>
            <Link
              href="/bookings"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith("/bookings")
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Bookings
            </Link>
            <Link
              href="/availability"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith("/availability")
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Availability
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                H
              </div>
              <span className="hidden sm:inline">Harish</span>
              <ChevronDown
                className={`hidden sm:block w-4 h-4 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-1">
                <Link
                  href="/settings/profile"
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  My profile
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
