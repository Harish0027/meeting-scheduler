"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Plus, Copy, Trash2, Edit2 } from "lucide-react";
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

interface DayConfig {
  enabled: boolean;
  slots: { startTime: string; endTime: string }[];
}

const DAYS = [
  { index: 0, name: "Sunday" },
  { index: 1, name: "Monday" },
  { index: 2, name: "Tuesday" },
  { index: 3, name: "Wednesday" },
  { index: 4, name: "Thursday" },
  { index: 5, name: "Friday" },
  { index: 6, name: "Saturday" },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Calcutta",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
];

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      options.push(`${hour}:${min}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Time picker dropdown component
function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected option when dropdown opens
  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const selectedOption = optionsRef.current.querySelector(
        `[data-value="${value}"]`
      );
      if (selectedOption) {
        selectedOption.scrollIntoView({ block: "center" });
      }
    }
  }, [isOpen, value]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-md text-sm bg-white hover:bg-neutral-50 min-w-25 justify-between"
      >
        <span>{formatTimeDisplay(value)}</span>
      </button>

      {isOpen && (
        <div
          ref={optionsRef}
          className="absolute top-full left-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 max-h-64 overflow-y-auto"
        >
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              data-value={time}
              onClick={() => {
                onChange(time);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-neutral-100 ${
                value === time
                  ? "bg-neutral-100 font-medium"
                  : "text-neutral-700"
              }`}
            >
              {formatTimeDisplay(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvailabilityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [isDefault, setIsDefault] = useState(false);

  // Day configurations
  const [dayConfigs, setDayConfigs] = useState<Record<number, DayConfig>>({});

  useEffect(() => {
    const loadSchedule = async () => {
      const response = await apiClient.get<Schedule>(`/schedules/${id}`);
      if (response.success && response.data) {
        setSchedule(response.data);
        setEditedName(response.data.name);
        setTimezone(response.data.timezone);
        setIsDefault(response.data.isDefault);

        // Convert slots to day configs
        const configs: Record<number, DayConfig> = {};
        DAYS.forEach((day) => {
          const daySlots = response.data!.slots.filter(
            (s) => s.dayOfWeek === day.index
          );
          configs[day.index] = {
            enabled: daySlots.length > 0,
            slots:
              daySlots.length > 0
                ? daySlots.map((s) => ({
                    startTime: s.startTime,
                    endTime: s.endTime,
                  }))
                : [{ startTime: "09:00", endTime: "17:00" }],
          };
        });
        setDayConfigs(configs);
      } else {
        toast.error("Schedule not found");
        router.push("/availability");
      }
      setIsLoading(false);
    };

    loadSchedule();
  }, [id, router]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  const handleToggleDay = (dayIndex: number) => {
    setDayConfigs((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        enabled: !prev[dayIndex]?.enabled,
      },
    }));
  };

  const handleSlotChange = (
    dayIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDayConfigs((prev) => {
      const dayConfig = { ...prev[dayIndex] };
      const slots = [...dayConfig.slots];
      slots[slotIndex] = { ...slots[slotIndex], [field]: value };
      return {
        ...prev,
        [dayIndex]: { ...dayConfig, slots },
      };
    });
  };

  const handleAddSlot = (dayIndex: number) => {
    setDayConfigs((prev) => {
      const dayConfig = { ...prev[dayIndex] };
      const slots = [
        ...dayConfig.slots,
        { startTime: "09:00", endTime: "17:00" },
      ];
      return {
        ...prev,
        [dayIndex]: { ...dayConfig, slots },
      };
    });
  };

  const handleCopyToAll = (dayIndex: number) => {
    const sourceConfig = dayConfigs[dayIndex];
    if (!sourceConfig) return;

    setDayConfigs((prev) => {
      const newConfigs = { ...prev };
      DAYS.forEach((day) => {
        if (day.index !== dayIndex) {
          newConfigs[day.index] = {
            enabled: sourceConfig.enabled,
            slots: sourceConfig.slots.map((s) => ({ ...s })),
          };
        }
      });
      return newConfigs;
    });
    toast.success("Copied to all days");
  };

  const handleSave = async () => {
    if (!schedule) return;

    setIsSaving(true);

    // Convert day configs back to slots
    const slots: { dayOfWeek: number; startTime: string; endTime: string }[] =
      [];
    Object.entries(dayConfigs).forEach(([dayIndex, config]) => {
      if (config.enabled) {
        config.slots.forEach((slot) => {
          slots.push({
            dayOfWeek: parseInt(dayIndex),
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        });
      }
    });

    const response = await apiClient.put(`/schedules/${id}`, {
      name: editedName,
      timezone,
      isDefault,
      slots,
    });

    if (response.success) {
      toast.success("Schedule saved");
      setSchedule(response.data as Schedule);
    } else {
      toast.error(response.error?.message || "Failed to save schedule");
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const response = await apiClient.delete(`/schedules/${id}`);

    if (response.success) {
      toast.success("Schedule deleted");
      router.push("/availability");
    } else {
      toast.error(response.error?.message || "Failed to delete schedule");
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSetDefault = async () => {
    const response = await apiClient.put(`/schedules/${id}/default`);
    if (response.success) {
      setIsDefault(true);
      toast.success("Set as default schedule");
    } else {
      toast.error("Failed to set as default");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/availability")}
              className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditing(false);
                    if (e.key === "Escape") {
                      setEditedName(schedule.name);
                      setIsEditing(false);
                    }
                  }}
                  className="text-lg font-semibold text-neutral-900 border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  autoFocus
                />
              ) : (
                <h1
                  onClick={() => setIsEditing(true)}
                  className="text-lg font-semibold text-neutral-900 cursor-pointer hover:text-neutral-600 flex items-center gap-1"
                >
                  {editedName}
                  <Edit2 className="w-4 h-4 text-neutral-400" />
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Set as default toggle */}
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Set as default</span>
              <button
                onClick={handleSetDefault}
                disabled={isDefault}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  isDefault ? "bg-neutral-300" : "bg-neutral-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isDefault ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="h-6 w-px bg-neutral-200" />
            {/* Delete button */}
            <button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="p-2 hover:bg-red-50 rounded-md transition-colors text-neutral-500 hover:text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-neutral-200" />
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-500 mt-1 ml-10">
          {(() => {
            // Group days by their time slots
            const enabledDays = Object.entries(dayConfigs)
              .filter(([, c]) => c.enabled)
              .map(([dayIndex, c]) => ({
                dayIndex: parseInt(dayIndex),
                dayName: DAYS[parseInt(dayIndex)].name.slice(0, 3),
                timeKey: c.slots
                  .map((s) => `${s.startTime}-${s.endTime}`)
                  .join(","),
                slots: c.slots,
              }));

            if (enabledDays.length === 0) return "No days selected";

            // Group by time slots
            const timeGroups: Record<
              string,
              {
                days: string[];
                slots: { startTime: string; endTime: string }[];
              }
            > = {};
            enabledDays.forEach(({ dayName, timeKey, slots }) => {
              if (!timeGroups[timeKey]) {
                timeGroups[timeKey] = { days: [], slots };
              }
              timeGroups[timeKey].days.push(dayName);
            });

            // Format the summary
            return Object.values(timeGroups)
              .map(({ days, slots }) => {
                const daysStr = days.join(", ");
                const timesStr = slots
                  .map(
                    (s) =>
                      `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`
                  )
                  .join(", ");
                return `${daysStr}, ${timesStr}`;
              })
              .join(" | ");
          })()}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Left - Schedule Editor */}
        <div className="flex-1">
          <div className="border border-neutral-200 rounded-lg p-6">
            <div className="space-y-4">
              {DAYS.map((day) => {
                const config = dayConfigs[day.index] || {
                  enabled: false,
                  slots: [{ startTime: "09:00", endTime: "17:00" }],
                };

                return (
                  <div key={day.index} className="flex items-start gap-4 py-2">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleDay(day.index)}
                      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 mt-1 ${
                        config.enabled ? "bg-neutral-900" : "bg-neutral-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          config.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>

                    {/* Day name */}
                    <div className="w-24 shrink-0 pt-1.5">
                      <span
                        className={`text-sm font-medium ${
                          config.enabled
                            ? "text-neutral-900"
                            : "text-neutral-400"
                        }`}
                      >
                        {day.name}
                      </span>
                    </div>

                    {/* Time slots */}
                    {config.enabled && (
                      <div className="flex-1 space-y-2">
                        {config.slots.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className="flex items-center gap-2"
                          >
                            <TimePicker
                              value={slot.startTime}
                              onChange={(value) =>
                                handleSlotChange(
                                  day.index,
                                  slotIndex,
                                  "startTime",
                                  value
                                )
                              }
                            />
                            <span className="text-neutral-400">-</span>
                            <TimePicker
                              value={slot.endTime}
                              onChange={(value) =>
                                handleSlotChange(
                                  day.index,
                                  slotIndex,
                                  "endTime",
                                  value
                                )
                              }
                            />
                            {/* Add slot button */}
                            <button
                              onClick={() => handleAddSlot(day.index)}
                              className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400 hover:text-neutral-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {/* Copy to all button */}
                            <button
                              onClick={() => handleCopyToAll(day.index)}
                              className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400 hover:text-neutral-600"
                              title="Copy to all days"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Timezone selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot
              be undone.
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
