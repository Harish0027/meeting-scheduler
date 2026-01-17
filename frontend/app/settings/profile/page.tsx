"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  timezone: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get<UserProfile>("/users/me");
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          username: response.data.username || "",
          name: response.data.name || "",
          email: response.data.email || "",
          bio: response.data.bio || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await apiClient.put("/users/me", {
        username: formData.username,
        name: formData.name,
        bio: formData.bio,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
        loadProfile();
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string, username: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return username[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-neutral-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
        <p className="text-neutral-600 mt-1">
          Manage settings for your Cal.com profile
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-neutral-200"
      >
        <div className="p-6 space-y-6">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Profile picture
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                style={{
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                }}
              >
                {getInitials(formData.name, formData.username)}
              </div>
              <div className="text-sm text-neutral-500">
                Avatar is generated from your name
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              Username
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-sm">
                cal.com/
              </span>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="flex-1 h-10 px-3 border border-neutral-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                required
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500 flex items-start gap-1">
              <svg
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Tip: You can add a &quot;+&quot; between usernames (e.g.
                cal.com/anna+brian) to meet with multiple people
              </span>
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              Full name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Email
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={formData.email}
                disabled
                className="flex-1 h-10 px-3 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500 cursor-not-allowed"
              />
              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                Primary
              </span>
            </div>
          </div>

          {/* About */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              About
            </label>
            <div className="border border-neutral-300 rounded-md">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200">
                <button
                  type="button"
                  className="p-1 hover:bg-neutral-100 rounded"
                  title="Bold"
                >
                  <svg
                    className="w-4 h-4 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-neutral-100 rounded"
                  title="Italic"
                >
                  <svg
                    className="w-4 h-4 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <line x1="19" y1="4" x2="10" y2="4" />
                    <line x1="14" y1="20" x2="5" y2="20" />
                    <line x1="15" y1="4" x2="9" y2="20" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-neutral-100 rounded"
                  title="Link"
                >
                  <svg
                    className="w-4 h-4 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>
              </div>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 focus:outline-none resize-none"
                placeholder="A little bit about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Footer with Update Button */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 rounded-b-lg flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
