"use client";

import React, { useEffect, useState } from "react";
import { User, Globe, Bell, Shield, Palette, CreditCard } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  username: string;
  timezone: string;
}

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    id: "general",
    label: "General",
    icon: Globe,
    description: "Language, timezone, and preferences",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and push notification settings",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Password and two-factor authentication",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    description: "Customize your booking page",
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    description: "Manage your subscription and payments",
  },
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="));
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="border border-gray-200 rounded-lg p-6">
              {activeSection === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Profile</h2>
                    <p className="text-sm text-gray-500">
                      This information will be displayed publicly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user?.username || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        cal.com/{user?.username}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <input
                        type="text"
                        value={user?.timezone || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "general" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">General</h2>
                    <p className="text-sm text-gray-500">
                      Configure your language and regional preferences.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Format
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm">
                        <option>12-hour (AM/PM)</option>
                        <option>24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeSection !== "profile" && activeSection !== "general" && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    {settingsSections.find((s) => s.id === activeSection)?.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
