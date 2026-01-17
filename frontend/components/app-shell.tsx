"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Link2,
  Calendar,
  Clock,
  Settings,
  Search,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  User,
  Copy,
  LogOut,
} from "lucide-react";

/* ================= Types ================= */

interface UserData {
  id: string;
  email: string;
  username: string;
  timezone: string;
}

interface AppShellProps {
  children: React.ReactNode;
}

/* ================= Navigation ================= */

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/availability", label: "Availability", icon: Clock },
  { href: "/event-types", label: "Event Types", icon: Link2 },
];

const userDropdownItems = [
  { label: "My profile", icon: User, href: "/settings/profile" },
  {
    label: "Sign out",
    icon: LogOut,
    action: "logout",
    className: "text-red-600",
  },
];

/* ================= AppShell ================= */

export function AppShell({ children }: AppShellProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const tabletMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  /* ================= Load user ================= */
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="));
    if (cookie) {
      try {
        setUser(JSON.parse(decodeURIComponent(cookie.split("=")[1])));
      } catch {}
    }
  }, []);

  /* ================= Close dropdowns ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      // Check both desktop and tablet menu refs
      const inDesktopMenu = userMenuRef.current?.contains(e.target as Node);
      const inTabletMenu = tabletMenuRef.current?.contains(e.target as Node);
      if (!inDesktopMenu && !inTabletMenu) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= Helpers ================= */

  const handleLogout = () => {
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const handleCopyLink = () => {
    if (!user?.username) return;
    navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
    toast.success("Link copied");
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  /* ================= Render ================= */

  return (
    <div className="flex min-h-screen bg-white">
      {/* ================= Mobile Header ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-medium">{user?.username ?? "Loading…"}</span>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* Hamburger Dropdown (profile + sign out) */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute right-3 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg py-1"
          >
            {userDropdownItems.map((item, i) =>
              item.action === "logout" ? (
                <button
                  key={i}
                  onClick={handleLogout}
                  className={`flex items-center gap-3 px-4 py-2 text-sm w-full hover:bg-gray-100 ${item.className}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ) : (
                <Link
                  key={i}
                  href={item.href!}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {/* ================= Mobile Bottom Navigation ================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-between items-center px-2 py-1"
        style={{ height: "56px" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                isActive(item.href) ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className="w-6 h-6 mb-0.5" />
              <span className="text-xs leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ================= Tablet Collapsed Sidebar (md to lg: 768px-1024px) ================= */}
      <aside className="hidden md:flex lg:hidden w-16 border-r bg-gray-50 flex-col items-center py-4">
        {/* User avatar at top */}
        <div className="mb-4 relative" ref={tabletMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium"
            title={user?.username}
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </button>

          {userMenuOpen && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/settings/profile");
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm w-full hover:bg-gray-100 text-left"
              >
                <User className="w-4 h-4" />
                My profile
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm w-full hover:bg-gray-100 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center rounded-md ${
                  isActive(item.href)
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>

        {/* Bottom icons */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t mt-4">
          <button
            onClick={handleCopyLink}
            title="Copy public link"
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          >
            <Copy className="w-5 h-5" />
          </button>
          <Link
            href="/settings"
            title="Settings"
            className={`w-10 h-10 flex items-center justify-center rounded-md ${
              pathname?.startsWith("/settings")
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </aside>

      {/* ================= Desktop Sidebar ================= */}
      <aside className="hidden lg:flex w-[250px] border-r bg-gray-50 flex-col">
        <div className="p-4 relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium">{user?.username}</span>
            <ChevronDown
              className={`w-4 h-4 transition ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute mt-2 w-full bg-white border rounded shadow">
              {userDropdownItems.map((item, i) =>
                item.action === "logout" ? (
                  <button
                    key={i}
                    onClick={handleLogout}
                    className={`flex gap-3 px-3 py-2 text-sm w-full hover:bg-gray-50 ${item.className}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={i}
                    href={item.href!}
                    className="flex gap-3 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        <nav className="px-3 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex gap-3 px-3 py-2 rounded-md text-sm ${
                isActive(item.href)
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-200"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleCopyLink}
            className="flex gap-3 px-3 py-2 text-sm hover:bg-gray-200 w-full"
          >
            <Copy className="w-4 h-4" />
            Copy public link
          </button>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <main className="flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
