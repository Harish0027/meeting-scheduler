"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Plus, Globe, MoreHorizontal, Copy, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Schedule {
  id: string;
  name: string;
  timezone: string;
  isDefault: boolean;
  slots: ScheduleSlot[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityPage() {
  const router = useRouter();
  const { user, initFromCookie } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "team">("my");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Duplicate dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicatingSchedule, setDuplicatingSchedule] =
    useState<Schedule | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);

  // New schedule dialog state
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize user from cookie on mount
  useEffect(() => {
    initFromCookie();
  }, [initFromCookie]);

  useEffect(() => {
    if (!user?.id) return;
    const loadSchedules = async () => {
      const response = await apiClient.get<Schedule[]>(
        `/schedules?userId=${user.id}`
      );
      if (response.success && response.data) {
        setSchedules(response.data);
      }
      setIsLoading(false);
    };

    loadSchedules();
  }, [user?.id]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getScheduleSummary = (schedule: Schedule) => {
    if (schedule.slots.length === 0) return "No availability set";

    // Group slots by time
    const slotsByTime: Record<string, number[]> = {};
    schedule.slots.forEach((slot) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!slotsByTime[key]) slotsByTime[key] = [];
      slotsByTime[key].push(slot.dayOfWeek);
    });

    const summaries: string[] = [];
    Object.entries(slotsByTime).forEach(([timeKey, days]) => {
      const [start, end] = timeKey.split("-");
      const sortedDays = days.sort((a, b) => a - b);

      // Check if Mon-Fri
      const isWeekdays =
        sortedDays.length === 5 && sortedDays.every((d, i) => d === i + 1);
      // Check if Mon-Thu
      const isMonThu =
        sortedDays.length === 4 && sortedDays.every((d, i) => d === i + 1);

      let dayStr = "";
      if (isWeekdays) {
        dayStr = "Mon - Fri";
      } else if (isMonThu) {
        dayStr = "Mon - Thu";
      } else if (sortedDays.length === 1) {
        dayStr = DAYS[sortedDays[0]];
      } else {
        // Check for consecutive days
        let isConsecutive = true;
        for (let i = 1; i < sortedDays.length; i++) {
          if (sortedDays[i] !== sortedDays[i - 1] + 1) {
            isConsecutive = false;
            break;
          }
        }
        if (isConsecutive && sortedDays.length > 2) {
          dayStr = `${DAYS[sortedDays[0]]} - ${
            DAYS[sortedDays[sortedDays.length - 1]]
          }`;
        } else {
          dayStr = sortedDays.map((d) => DAYS[d]).join(", ");
        }
      }

      summaries.push(`${dayStr}, ${formatTime(start)} - ${formatTime(end)}`);
    });

    return summaries;
  };

  const handleScheduleClick = (scheduleId: string) => {
    router.push(`/availability/${scheduleId}`);
  };

  const openDuplicateDialog = (schedule: Schedule) => {
    setDuplicatingSchedule(schedule);
    setDuplicateName(`${schedule.name} (Copy)`);
    setDuplicateDialogOpen(true);
    setActiveMenu(null);
  };

  const handleDuplicate = async () => {
    if (!duplicatingSchedule || !duplicateName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsDuplicating(true);
    const response = await apiClient.post<Schedule>(
      `/schedules/${duplicatingSchedule.id}/duplicate`,
      { name: duplicateName.trim() }
    );

    if (response.success && response.data) {
      toast.success("Schedule duplicated");
      setDuplicateDialogOpen(false);
      router.push(`/availability/${response.data.id}`);
    } else {
      toast.error(response.error?.message || "Failed to duplicate schedule");
    }
    setIsDuplicating(false);
  };

  const openDeleteDialog = (schedule: Schedule) => {
    setDeletingSchedule(schedule);
    setDeleteDialogOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;

    setIsDeleting(true);
    const response = await apiClient.delete(
      `/schedules/${deletingSchedule.id}`
    );
    if (response.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== deletingSchedule.id));
      toast.success("Schedule deleted");
      setDeleteDialogOpen(false);
    } else {
      toast.error(response.error?.message || "Failed to delete schedule");
    }
    setIsDeleting(false);
  };

  const openNewDialog = () => {
    setNewScheduleName("");
    setNewDialogOpen(true);
  };

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsCreating(true);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await apiClient.post<Schedule>(
      `/schedules?userId=${user?.id}`,
      {
        name: newScheduleName.trim(),
        timezone: userTimezone,
        slots: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
        ],
      }
    );

    if (response.success && response.data) {
      setNewDialogOpen(false);
      router.push(`/availability/${response.data.id}`);
    } else {
      toast.error("Failed to create schedule");
    }
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
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
            {/* New Button */}
            <button
              onClick={openNewDialog}
              className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {schedules.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-200 rounded-lg py-20 px-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <Globe className="w-7 h-7 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No availability schedules
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
                Create your first availability schedule to let people know when
                you&apos;re free for meetings.
              </p>
              <button
                onClick={openNewDialog}
                className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200">
            {schedules.map((schedule) => {
              const summaries = getScheduleSummary(schedule);
              return (
                <div
                  key={schedule.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => handleScheduleClick(schedule.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-medium text-neutral-900">
                        {schedule.name}
                      </span>
                      {schedule.isDefault && (
                        <span className="px-2 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5">
                      {Array.isArray(summaries) ? (
                        summaries.map((line, i) => (
                          <p key={i} className="text-sm text-neutral-600">
                            {line}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-600">{summaries}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{schedule.timezone}</span>
                    </div>
                  </div>

                  {/* 3-dots menu */}
                  <div
                    className="relative self-start"
                    ref={activeMenu === schedule.id ? menuRef : null}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(
                          activeMenu === schedule.id ? null : schedule.id
                        );
                      }}
                      className="p-2 hover:bg-neutral-100 rounded-md transition-colors border border-neutral-200"
                    >
                      <MoreHorizontal className="w-5 h-5 text-neutral-500" />
                    </button>

                    {activeMenu === schedule.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                        <button
                          onClick={() => openDuplicateDialog(schedule)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                        >
                          <Copy className="w-4 h-4 text-neutral-500" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => openDeleteDialog(schedule)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Schedule</DialogTitle>
            <DialogDescription>
              Enter a name for the duplicated schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Schedule name
            </label>
            <input
              type="text"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="e.g., Work Hours"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDuplicate();
              }}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setDuplicateDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDuplicate}
              disabled={!duplicateName.trim() || isDuplicating}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a new schedule</DialogTitle>
            <DialogDescription>
              Create a new availability schedule for your meetings.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={newScheduleName}
              onChange={(e) => setNewScheduleName(e.target.value)}
              placeholder="e.g., Working Hours"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSchedule();
              }}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setNewDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSchedule}
              disabled={!newScheduleName.trim() || isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? "Creating..." : "Continue"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingSchedule?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
