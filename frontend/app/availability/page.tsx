"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { Plus, Globe, MoreHorizontal } from "lucide-react";

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Calcutta");
  const [activeTab, setActiveTab] = useState<"my" | "team">("my");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    const loadAvailability = async () => {
      const response = await apiClient.get<Availability[]>("/availability");
      if (response.success && response.data) {
        setAvailabilities(response.data);
      }
      setIsLoading(false);
    };

    loadAvailability();
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getScheduleSummary = () => {
    if (availabilities.length === 0) return "No availability set";
    
    const sortedDays = availabilities.map(a => a.dayOfWeek).sort((a, b) => a - b);
    const times = availabilities[0];
    
    // Check if consecutive weekdays (Mon-Fri = 1-5)
    const isWeekdays = sortedDays.length === 5 && 
      sortedDays.every((d, i) => d === i + 1);
    
    if (isWeekdays) {
      return `Mon - Fri, ${formatTime(times.startTime)} - ${formatTime(times.endTime)}`;
    }
    
    // Check if all same time
    const allSameTime = availabilities.every(
      a => a.startTime === times.startTime && a.endTime === times.endTime
    );
    
    if (allSameTime && sortedDays.length > 0) {
      const dayRange = sortedDays.map(d => DAYS[d]).join(", ");
      return `${dayRange}, ${formatTime(times.startTime)} - ${formatTime(times.endTime)}`;
    }
    
    return `${availabilities.length} schedules configured`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Availability</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Configure times when you are available for bookings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "my"
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                My availability
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-neutral-200 ${
                  activeTab === "team"
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                Team availability
              </button>
            </div>
            {/* New Button */}
            <button className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {/* Schedule Card */}
        <div className="border border-neutral-200 rounded-lg">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-medium text-neutral-900">2</span>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">
                  Default
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-2">
                {getScheduleSummary()}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                <Globe className="w-3.5 h-3.5" />
                <span>{timezone}</span>
              </div>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-md transition-colors self-start">
              <MoreHorizontal className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Out of office link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Temporarily out-of-office?{" "}
            <button className="text-neutral-900 underline hover:no-underline">
              Add a redirect
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
