"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Link2,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Gift,
  Settings,
  Search,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  User,
  Moon,
  Map,
  HelpCircle,
  Download,
  LogOut,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  username: string;
  timezone: string;
}

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/availability", label: "Availability", icon: Clock },
  { href: "/event-types", label: "Event Types", icon: Link2 },
];

const bottomItems = [
  { href: "#", label: "View public page", icon: ExternalLink },
  { href: "#", label: "Copy public page link", icon: Copy, action: "copy" },
  { href: "#", label: "Refer and earn", icon: Gift },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: AppShellProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="));
    if (userCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userCookie.split("=")[1])
        );
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    if (user?.username) {
      const link = `${window.location.origin}/${user.username}`;
      navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLogout = () => {
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/event-types") {
      return (
        pathname === "/event-types" || pathname.startsWith("/event-types/")
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const userMenuItems = [
    { label: "My profile", icon: User, href: "#" },
    { label: "My settings", icon: Settings, href: "/settings" },
    { label: "Out of office", icon: Moon, href: "#" },
    { divider: true },
    { label: "Roadmap", icon: Map, href: "#" },
    { label: "Help", icon: HelpCircle, href: "#" },
    { label: "Download desktop app", icon: Download, href: "#" },
    { divider: true },
    {
      label: "Sign out",
      icon: LogOut,
      action: "logout",
      className: "text-red-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {user && (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <span className="font-medium text-gray-900">
              {user?.username || "Loading..."}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[250px] bg-[#f9f9f9] transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile User Header */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {user && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <span className="font-medium text-gray-900 text-sm">
                  {user?.username || "Loading..."}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <button className="p-1.5 hover:bg-gray-200 rounded-md">
                <Search className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <nav className="flex-1 px-3 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-0.5 ${
                    active
                      ? "bg-gray-200/80 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Bottom Items */}
          <div className="px-3 py-2 border-t border-gray-200">
            {bottomItems.map((item, idx) => {
              const Icon = item.icon;
              if (item.action === "copy") {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      handleCopyLink();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-200/50 w-full"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </button>
                );
              }
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-200/50"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Footer */}
          <div className="px-4 py-3 text-xs text-gray-400">
            2026 Cal.com, Inc. v.6.1.0-h-8d1ad74
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[250px] border-r border-gray-200 bg-[#f9f9f9]">
        {/* User Header with Dropdown */}
        <div className="p-4 relative" ref={userMenuRef}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-gray-200/50 rounded-md px-1.5 py-1 -ml-1.5"
            >
              {user && (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <span className="font-medium text-gray-900 text-sm">
                {user?.username || "Loading..."}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded-md">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* User Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {userMenuItems.map((item, idx) => {
                if (item.divider) {
                  return (
                    <div key={idx} className="my-1 border-t border-gray-100" />
                  );
                }
                const Icon = item.icon!;
                if (item.action === "logout") {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-sm w-full hover:bg-gray-50 ${
                        item.className || "text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    onClick={() => setUserMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 ${
                      item.className || "text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-0.5 ${
                  active
                    ? "bg-gray-200/80 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-2 border-t border-gray-200">
          {bottomItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.action === "copy") {
              return (
                <button
                  key={idx}
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-200/50 w-full"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.label}
                </button>
              );
            }
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-200/50"
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-xs text-gray-400">
          2026 Cal.com, Inc. v.6.1.0-h-8d1ad74
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-auto pt-14 lg:pt-0 bg-white">
        {children}
      </main>
    </div>
  );
}
