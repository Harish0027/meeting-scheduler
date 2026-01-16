"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import {
  Plus,
  Search,
  Link2,
  ExternalLink,
  MoreHorizontal,
  Clock,
  Pencil,
  Files,
  Code,
  Trash2,
} from "lucide-react";

interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  isActive: boolean;
  userId: string;
}

interface User {
  id: string;
  username: string;
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [newEventData, setNewEventData] = useState({
    title: "",
    slug: "",
    description: "",
    duration: 15,
  });
  const [isCreating, setIsCreating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      // Load User
      const userResponse = await apiClient.get<User>("/users/profile");
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }

      // Load Event Types
      const eventResponse = await apiClient.get<EventType[]>("/event-types");
      if (eventResponse.success && eventResponse.data) {
        setEventTypes(eventResponse.data);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleActive = async (eventType: EventType) => {
    const response = await apiClient.put<EventType>(
      `/event-types/${eventType.id}`,
      { isActive: !eventType.isActive }
    );
    if (response.success && response.data) {
      setEventTypes((prev) =>
        prev.map((et) => (et.id === eventType.id ? response.data! : et))
      );
      toast.success(`Event ${response.data.isActive ? "enabled" : "disabled"}`);
    }
  };

  const handleCopyLink = (eventType: EventType) => {
    if (user?.username) {
      // Use window.location.origin to get the current base URL (e.g. http://localhost:3000 or production domain)
      const link = `${window.location.origin}/${user.username}/${eventType.slug}`;
      navigator.clipboard
        .writeText(link)
        .then(() => toast.success("Link copied!"))
        .catch(() => toast.error("Failed to copy link"));
    } else {
      toast.error("User profile not loaded yet. Please try again.");
    }
  };

  const handlePreview = (eventType: EventType) => {
    if (user?.username) {
      window.open(
        `/${user.username}/${eventType.slug}?overlayCalendar=true`,
        "_blank"
      );
    }
  };

  const handleDelete = async (eventType: EventType) => {
    setActiveMenu(null); // Close menu first
    if (confirm("Are you sure you want to delete this event type?")) {
      const response = await apiClient.delete(`/event-types/${eventType.id}`);
      if (response.success) {
        setEventTypes((prev) => prev.filter((et) => et.id !== eventType.id));
        toast.success("Event type deleted");
      } else {
        toast.error(response.error?.message || "Failed to delete event type");
      }
    }
  };

  const handleDuplicate = async (eventType: EventType) => {
    setActiveMenu(null);
    const newTitle = `${eventType.title} (Copy)`;
    const newSlug = `${eventType.slug}-copy-${Math.floor(
      Math.random() * 1000
    )}`;

    const response = await apiClient.post<EventType>("/event-types", {
      title: newTitle,
      slug: newSlug,
      description: eventType.description,
      duration: eventType.duration,
    });

    if (response.success && response.data) {
      setEventTypes((prev) => [...prev, response.data!]);
      toast.success("Event type duplicated!");
    } else {
      toast.error(response.error?.message || "Failed to duplicate event type");
    }
  };

  const handleCreateEventType = async () => {
    if (!newEventData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsCreating(true);
    const slug =
      newEventData.slug ||
      newEventData.title.toLowerCase().replace(/\s+/g, "-");

    const response = await apiClient.post<EventType>("/event-types", {
      title: newEventData.title,
      slug,
      description: newEventData.description || null,
      duration: newEventData.duration,
    });

    if (response.success && response.data) {
      setEventTypes((prev) => [...prev, response.data!]);
      toast.success("Event type created!");
      setShowNewModal(false);
      setNewEventData({ title: "", slug: "", description: "", duration: 15 });
    } else {
      toast.error(response.error?.message || "Failed to create event type");
    }
    setIsCreating(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const filteredEventTypes = eventTypes.filter((et) =>
    et.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Event types</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure different events for people to book on your calendar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Event Types List */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {filteredEventTypes.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <Link2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No event types found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first event type to get started.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Event Type
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg">
            {filteredEventTypes.map((eventType, index) => (
              <div
                key={eventType.id}
                className={`flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors ${
                  index !== filteredEventTypes.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                {/* Left Side - Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {eventType.title}
                    </h3>
                    <span className="text-sm text-gray-400">
                      /{user?.username}/{eventType.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                      <Clock className="w-3 h-3" />
                      {eventType.duration}m
                    </span>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(eventType)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      eventType.isActive ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        eventType.isActive ? "left-7" : "left-1"
                      }`}
                    />
                  </button>

                  {/* Preview Button */}
                  <button
                    onClick={() => handlePreview(eventType)}
                    className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    title="Preview"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Copy Link Button */}
                  <button
                    onClick={() => handleCopyLink(eventType)}
                    className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    title="Copy link"
                  >
                    <Link2 className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* More Actions Menu */}
                  <div
                    className="relative"
                    ref={activeMenu === eventType.id ? menuRef : null}
                  >
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === eventType.id ? null : eventType.id
                        )
                      }
                      className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>

                    {activeMenu === eventType.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => {
                            router.push(`/event-types/${eventType.id}`);
                            setActiveMenu(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(eventType)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        >
                          <Files className="w-4 h-4" />
                          Duplicate
                        </button>
                        {/* Embed option removed as requested */}
                        <button
                          onClick={() => handleDelete(eventType)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Event Type Modal */}
      {showNewModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowNewModal(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add a new event type
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set up event types to offer different types of meetings.
                </p>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newEventData.title}
                    onChange={(e) => {
                      setNewEventData({
                        ...newEventData,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Quick chat"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <span className="px-3 py-2 bg-gray-50 text-sm text-gray-500 border-r border-gray-200 whitespace-nowrap">
                      {/* Show relative path context instead of hardcoded cal.com */}
                      /{user?.username}/
                    </span>
                    <input
                      type="text"
                      value={newEventData.slug}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          slug: e.target.value,
                        })
                      }
                      placeholder="quick-chat"
                      className="flex-1 px-3 py-2 text-sm focus:outline-none min-w-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                      <button className="p-1 hover:bg-gray-200 rounded font-bold text-sm text-gray-600">
                        B
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded italic text-sm text-gray-600">
                        I
                      </button>
                    </div>
                    <textarea
                      value={newEventData.description}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          description: e.target.value,
                        })
                      }
                      placeholder="A quick video meeting."
                      rows={3}
                      className="w-full px-3 py-2 text-sm focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Duration
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <input
                      type="number"
                      value={newEventData.duration}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          duration: parseInt(e.target.value) || 15,
                        })
                      }
                      className="flex-1 px-3 py-2 text-sm focus:outline-none"
                      min={5}
                      max={480}
                    />
                    <span className="px-3 py-2 bg-gray-50 text-sm text-gray-500 border-l border-gray-200">
                      minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowNewModal(false);
                    setNewEventData({
                      title: "",
                      slug: "",
                      description: "",
                      duration: 15,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleCreateEventType}
                  disabled={isCreating || !newEventData.title.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
