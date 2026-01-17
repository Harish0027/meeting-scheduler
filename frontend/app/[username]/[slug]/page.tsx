"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import {
  Clock,
  Video,
  Globe,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Check,
  ExternalLink,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
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

interface EventType {
  id: string;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  user?: {
    username: string;
    email: string;
  };
}

interface TimeSlot {
  start: string;
  end: string;
}

interface OriginalBooking {
  id: string;
  startTime: string;
  endTime: string;
  bookerName: string;
  bookerEmail: string;
  notes?: string;
}

type BookingStep = "calendar" | "form" | "confirmation";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const slug = params.slug as string;

  // Get query params for reschedule flow
  const slotParam = searchParams.get("slot");
  const rescheduleUid = searchParams.get("rescheduleUid");
  const rescheduledBy = searchParams.get("rescheduledBy");
  const isRescheduleMode = !!rescheduleUid;

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [step, setStep] = useState<BookingStep>("calendar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [showTimezoneSelect, setShowTimezoneSelect] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [overlayCalendar, setOverlayCalendar] = useState(
    searchParams.get("overlayCalendar") === "true"
  );
  const [hostName, setHostName] = useState("");
  const [originalBooking, setOriginalBooking] =
    useState<OriginalBooking | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    notes: string;
    guests: string[];
  }>({
    name: "",
    email: "",
    notes: "",
    guests: [],
  });

  const [showGuestInput, setShowGuestInput] = useState(false);

  // Build URL with current query params (helper function)
  const buildUrl = useCallback(
    (additionalParams: Record<string, string | null> = {}) => {
      const baseUrl = `/${username}/${slug}`;
      const params = new URLSearchParams();

      // Preserve reschedule params
      if (rescheduleUid) params.set("rescheduleUid", rescheduleUid);
      if (rescheduledBy) params.set("rescheduledBy", rescheduledBy);
      if (overlayCalendar) params.set("overlayCalendar", "true");

      // Add/remove additional params
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    },
    [username, slug, rescheduleUid, rescheduledBy, overlayCalendar]
  );

  // Load original booking for reschedule mode
  useEffect(() => {
    const loadOriginalBooking = async () => {
      if (!rescheduleUid) return;

      try {
        const response = await apiClient.get<OriginalBooking>(
          `/bookings/${rescheduleUid}`
        );
        if (response.success && response.data) {
          setOriginalBooking(response.data);
          // Pre-fill form with original booking data
          setFormData((prev) => ({
            ...prev,
            name: response.data.bookerName || prev.name,
            email: response.data.bookerEmail || prev.email,
          }));
        }
      } catch (error) {
        console.error("Failed to load original booking:", error);
      }
    };

    loadOriginalBooking();
  }, [rescheduleUid]);

  // Load current user for pre-filling form (only if not reschedule mode)
  useEffect(() => {
    if (isRescheduleMode) return; // Skip for reschedule - use booking data instead

    const loadCurrentUser = async () => {
      try {
        const response = await apiClient.get<any>("/users/profile");
        if (response.success && response.data) {
          setFormData((prev) => ({
            ...prev,
            name: response.data.username || "",
            email: response.data.email || "",
          }));
        }
      } catch (error) {
        // User not logged in, ignore
      }
    };
    loadCurrentUser();
  }, [isRescheduleMode]);

  // Parse slot from URL on mount
  useEffect(() => {
    if (slotParam) {
      const slotDate = new Date(slotParam);
      if (!isNaN(slotDate.getTime())) {
        setSelectedDate(slotDate);
        // Create slot with duration
        const endDate = new Date(slotDate);
        endDate.setMinutes(endDate.getMinutes() + (eventType?.duration || 15));
        setSelectedSlot({
          start: slotParam,
          end: endDate.toISOString(),
        });
        setStep("form");
      }
    }
  }, [slotParam, eventType?.duration]);

  // Load event type
  useEffect(() => {
    const loadEventType = async () => {
      const response = await apiClient.get<EventType>(
        `/event-types/${username}/${slug}`
      );
      if (response.success && response.data) {
        setEventType(response.data);
        // Extract host name from username (format it nicely)
        const formattedName = username
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        setHostName(formattedName);
      } else {
        toast.error("Event type not found");
      }
    };

    if (username && slug) {
      loadEventType();
    }
  }, [username, slug]);

  // Load time slots when date is selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDate || !eventType) return;

      setIsLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await apiClient.get<TimeSlot[]>(
        `/bookings/${username}/${slug}/slots?date=${dateStr}`
      );

      if (response.success && response.data) {
        setTimeSlots(response.data);
      } else {
        setTimeSlots([]);
      }
      setIsLoadingSlots(false);
    };

    loadTimeSlots();
  }, [selectedDate, username, slug, eventType]);

  // Calendar helpers - show multiple weeks including next month
  const calendarWeeks = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Add days for 6 weeks total to show continuity
    let currentDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 2, 0); // Go into next month

    while (currentDate <= endDate || currentWeek.length > 0) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
        if (weeks.length >= 6) break;
      }

      if (currentDate <= endDate) {
        currentWeek.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentWeek.push(null);
      }
    }

    if (currentWeek.length > 0 && currentWeek.length < 7) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentMonth]);

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    // Available Mon-Fri (1-5) and not in the past
    return date >= today && day >= 1 && day <= 5;
  };

  const isNextMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() !== currentMonth.getMonth();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    try {
      if (timeFormat === "24h") {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone,
        });
      }
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
    } catch (e) {
      console.error("Invalid timezone:", timezone);
      // Fallback to local time if timezone is invalid
      return date.toLocaleTimeString("en-US", {
        hour: timeFormat === "24h" ? "2-digit" : "numeric",
        minute: "2-digit",
        hour12: timeFormat !== "24h",
      });
    }
  };

  const formatTimeShort = (dateStr: string) => {
    return formatTime(dateStr);
  };

  // Filter out past time slots
  const availableTimeSlots = useMemo(() => {
    if (!timeSlots.length) return [];

    const now = new Date();
    return timeSlots.filter((slot) => {
      const slotTime = new Date(slot.start);
      return slotTime > now;
    });
  }, [timeSlots]);

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    // Update URL with slot parameter while preserving other params
    const newUrl = buildUrl({ slot: slot.start });
    window.history.pushState({}, "", newUrl);
    setStep("form");
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("calendar");
      setSelectedSlot(null);
      // Remove slot from URL while preserving reschedule params
      const newUrl = buildUrl({ slot: null });
      window.history.pushState({}, "", newUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !selectedDate || !eventType) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    // For reschedule, show confirmation dialog instead of submitting directly
    if (isRescheduleMode && rescheduleUid) {
      setRescheduleDialogOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post(`/bookings/${username}/${slug}`, {
        eventTypeId: eventType.id,
        eventTypeSlug: slug,
        bookerName: formData.name,
        bookerEmail: formData.email,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        timeZone: timezone,
        notes: formData.notes || undefined,
        guests: formData.guests.filter((g) => g.trim() !== ""),
      });

      if (response.success) {
        setBookingData({
          bookingId: response.data?.id,
          eventTitle: eventType.title,
          hostName: hostName,
          hostEmail: eventType.user?.email,
          guestName: formData.name,
          guestEmail: formData.email,
          guests: formData.guests,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          duration: eventType.duration,
        });
        setStep("confirmation");
        toast.success("Booking confirmed!");
      } else {
        toast.error(response.error?.message || "Failed to create booking");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = () => {
    if (!bookingData?.bookingId) return;
    setCancelDialogOpen(true);
  };

  const confirmReschedule = async () => {
    if (!selectedSlot || !selectedDate || !eventType || !rescheduleUid) return;

    setRescheduleDialogOpen(false);
    setIsSubmitting(true);

    try {
      const response = await apiClient.put(
        `/bookings/${rescheduleUid}/reschedule`,
        {
          bookerEmail: formData.email,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          rescheduleReason: rescheduleReason || undefined,
        }
      );

      if (response.success) {
        setBookingData({
          eventTitle: eventType.title,
          hostName: hostName,
          hostEmail: eventType.user?.email,
          guestName: formData.name,
          guestEmail: formData.email,
          guests: formData.guests,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          duration: eventType.duration,
          isRescheduled: true,
        });
        setStep("confirmation");
        toast.success("Booking rescheduled!");
      } else {
        toast.error(response.error?.message || "Failed to reschedule booking");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCancelBooking = async () => {
    if (!bookingData?.bookingId) return;

    setCancelDialogOpen(false);

    try {
      const response = await apiClient.put(
        `/bookings/${bookingData.bookingId}/cancel`,
        {
          bookerEmail: bookingData.guestEmail,
        }
      );

      if (response.success) {
        toast.success("Booking cancelled successfully");
        router.push("/bookings");
      } else {
        toast.error(response.error?.message || "Failed to cancel booking");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  const handleRescheduleBooking = () => {
    if (!bookingData?.bookingId) return;

    // Redirect to booking page with reschedule params including overlayCalendar
    const rescheduleUrl = `/${username}/${slug}?rescheduleUid=${
      bookingData.bookingId
    }&rescheduledBy=${encodeURIComponent(
      bookingData.guestEmail
    )}&overlayCalendar=true`;
    router.push(rescheduleUrl);
  };

  if (!eventType) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Confirmation Step
  if (step === "confirmation" && bookingData) {
    return (
      <div className="min-h-screen bg-[#f3f4f6]">
        {/* Header */}
        <div className="p-4">
          <button
            onClick={() => router.push("/bookings")}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to bookings
          </button>
        </div>

        <div className="flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-lg w-full p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
              {bookingData.isRescheduled
                ? "This meeting has been rescheduled"
                : "This meeting is scheduled"}
            </h1>
            <p className="text-gray-500 text-center mb-8">
              We sent an email with a calendar invitation with the details to
              everyone.
            </p>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              {/* Rescheduled by - Only show if rescheduled */}
              {bookingData.isRescheduled && (
                <div className="flex gap-4">
                  <span className="text-gray-500 w-24 flex-shrink-0">
                    Rescheduled by
                  </span>
                  <div className="text-gray-900">
                    <p>{bookingData.guestEmail}</p>
                    <button className="text-sm text-blue-600 hover:underline mt-1">
                      Original booking
                    </button>
                  </div>
                </div>
              )}

              {/* What */}
              <div className="flex gap-4">
                <span className="text-gray-500 w-24 flex-shrink-0">What</span>
                <span className="text-gray-900">
                  {bookingData.eventTitle} between {bookingData.hostName} and{" "}
                  {bookingData.guestName}
                </span>
              </div>

              {/* When */}
              <div className="flex gap-4">
                <span className="text-gray-500 w-24 flex-shrink-0">When</span>
                <div className="text-gray-900">
                  <p>{formatSelectedDate()}</p>
                  <p>
                    {formatTime(bookingData.startTime)} -{" "}
                    {formatTime(bookingData.endTime)} ({timezone})
                  </p>
                </div>
              </div>

              {/* Who */}
              <div className="flex gap-4">
                <span className="text-gray-500 w-24 flex-shrink-0">Who</span>
                <div className="text-gray-900">
                  <div className="mb-4">
                    <p className="font-medium">
                      {bookingData.hostName}{" "}
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded ml-1">
                        Host
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      {bookingData.hostEmail}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">{bookingData.guestName}</p>
                    <p className="text-gray-500 text-sm">
                      {bookingData.guestEmail}
                    </p>
                  </div>

                  {bookingData.guests && bookingData.guests.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-1">Guests:</p>
                      {bookingData.guests.map((guest: string, idx: number) => (
                        <p key={idx} className="text-gray-500 text-sm">
                          {guest}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Where */}
              <div className="flex gap-4">
                <span className="text-gray-500 w-24 flex-shrink-0">Where</span>
                <a
                  href="#"
                  className="text-gray-900 flex items-center gap-1 hover:underline"
                >
                  Cal Video
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Need to make a change?{" "}
                <button
                  onClick={handleRescheduleBooking}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Reschedule
                </button>
                {" or "}
                <button
                  onClick={handleCancelBooking}
                  className="text-red-600 hover:underline font-medium"
                >
                  Cancel
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <span className="text-xl font-bold text-gray-900">Cal.com</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl w-full">
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel - Event Info */}
            <div className="p-6 lg:w-72 lg:border-r border-b lg:border-b-0 border-gray-200">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium mb-3 border-2 border-purple-200">
                {username.charAt(0).toUpperCase()}
              </div>

              <p className="text-purple-600 text-sm font-medium">{hostName}</p>
              <h1 className="text-xl font-semibold text-gray-900 mt-1 mb-4">
                {eventType.title}
              </h1>

              {/* Former time - Only show in reschedule mode */}
              {isRescheduleMode && originalBooking && (
                <div className="flex items-start gap-2 text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-gray-500 font-medium">Former time</p>
                    <p className="line-through text-gray-500">
                      {new Date(originalBooking.startTime).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p className="line-through text-gray-500">
                      {formatTimeShort(originalBooking.startTime)}
                    </p>
                  </div>
                </div>
              )}

              {/* New time - Show date/time in form step */}
              {step === "form" && selectedDate && selectedSlot && (
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <p>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p>
                      {formatTimeShort(selectedSlot.start)} -{" "}
                      {formatTimeShort(selectedSlot.end)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{eventType.duration}m</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <Video className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Cal Video</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 relative">
                <Globe className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setShowTimezoneSelect(!showTimezoneSelect)}
                  className="text-sm flex items-center gap-1 hover:text-gray-900"
                >
                  {timezone.replace(/_/g, " ")}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showTimezoneSelect && (
                  <div className="absolute top-8 left-0 z-50 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {[
                      "Asia/Dushanbe",
                      "Asia/Kolkata",
                      "Asia/Tashkent",
                      "Asia/Samarkand",
                      "UTC",
                      "America/New_York",
                      "Europe/London",
                    ].map((tz) => (
                      <button
                        key={tz}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => {
                          setTimezone(tz);
                          setShowTimezoneSelect(false);
                        }}
                      >
                        {tz.replace(/_/g, " ")}
                        {timezone === tz && (
                          <Check className="w-3 h-3 text-gray-900" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Calendar or Form */}
            {step === "calendar" && (
              <div className="flex-1 flex flex-col lg:flex-row">
                {/* Calendar */}
                <div className="flex-1 p-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                      })}{" "}
                      <span className="text-gray-900">
                        {currentMonth.getFullYear()}
                      </span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() - 1
                            )
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() + 1
                            )
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-gray-500 py-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar Grid */}
                  <div className="space-y-1">
                    {calendarWeeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="grid grid-cols-7 gap-1">
                        {/* Show month label for first day of new month */}
                        {week.map((date, dayIdx) => {
                          const isAvailable = isDateAvailable(date);
                          const isSelected =
                            date &&
                            selectedDate &&
                            date.toDateString() === selectedDate.toDateString();
                          const isToday =
                            date &&
                            date.toDateString() === new Date().toDateString();
                          const showMonthLabel =
                            date &&
                            (date.getDate() === 1 ||
                              (dayIdx === 0 &&
                                weekIdx === 0 &&
                                !isNextMonth(date))) &&
                            !isNextMonth(date);

                          return (
                            <div key={dayIdx} className="relative">
                              {showMonthLabel && (
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 whitespace-nowrap uppercase tracking-wider">
                                  {date.toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </span>
                              )}
                              <button
                                disabled={!isAvailable}
                                onClick={() => date && setSelectedDate(date)}
                                className={`
                                  w-full aspect-square flex items-center justify-center text-sm rounded-md transition-colors relative
                                  ${!date ? "invisible" : ""}
                                  ${
                                    isSelected
                                      ? "bg-gray-900 text-white font-medium"
                                      : isAvailable
                                      ? "bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-medium"
                                      : "text-gray-400 cursor-default"
                                  }
                                `}
                              >
                                {date?.getDate()}
                                {isToday && !isSelected && (
                                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="lg:w-48 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
                    {/* Date & Time Format */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}{" "}
                        {selectedDate.getDate()}
                      </h3>
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden text-xs">
                        <button
                          onClick={() => setTimeFormat("12h")}
                          className={`px-2 py-1 ${
                            timeFormat === "12h"
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                        >
                          12h
                        </button>
                        <button
                          onClick={() => setTimeFormat("24h")}
                          className={`px-2 py-1 border-l border-gray-200 ${
                            timeFormat === "24h"
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                        >
                          24h
                        </button>
                      </div>
                    </div>

                    {/* Slots List */}
                    <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                      {isLoadingSlots ? (
                        <div className="flex justify-center py-8">
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm font-medium text-gray-900">
                            No slots available
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Try another date
                          </p>
                        </div>
                      ) : (
                        availableTimeSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex gap-2 animate-in fade-in slide-in-from-left-4 duration-500"
                            style={{
                              animationDelay: `${idx * 30}ms`,
                              animationFillMode: "backwards",
                            }}
                          >
                            <button
                              onClick={() => handleSlotSelect(slot)}
                              className="flex-1 py-2.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 hover:border-gray-900 hover:border-2 hover:text-gray-900 transition-all text-center relative group"
                            >
                              {formatTimeShort(slot.start)}
                              <div className="absolute inset-0 rounded-md ring-2 ring-gray-900 opacity-0 group-hover:opacity-10 transition-opacity" />
                            </button>
                            {/* We could add 15m/30m/60m options here if we were implementing variable duration */}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Booking Form */}
            {step === "form" && (
              <div className="flex-1 p-6 border-l border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your name{" "}
                      {!isRescheduleMode && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                      required={!isRescheduleMode}
                      readOnly={isRescheduleMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email address{" "}
                      {!isRescheduleMode && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                      required={!isRescheduleMode}
                      readOnly={isRescheduleMode}
                    />
                  </div>

                  {/* Add guests - only for new bookings */}
                  {!isRescheduleMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add guests
                      </label>
                      <div className="space-y-2">
                        {showGuestInput ? (
                          <>
                            {formData.guests.map((guest, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input
                                  type="email"
                                  value={guest}
                                  onChange={(e) => {
                                    const newGuests = [...formData.guests];
                                    newGuests[idx] = e.target.value;
                                    setFormData({
                                      ...formData,
                                      guests: newGuests,
                                    });
                                  }}
                                  placeholder="Email"
                                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newGuests = formData.guests.filter(
                                      (_, i) => i !== idx
                                    );
                                    setFormData({
                                      ...formData,
                                      guests: newGuests,
                                    });
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  guests: [...formData.guests, ""],
                                })
                              }
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                              <Users className="w-4 h-4" />
                              Add another
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowGuestInput(true);
                              setFormData({ ...formData, guests: [""] });
                            }}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                          >
                            <Users className="w-4 h-4" />
                            Add guests
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reason for reschedule - only in reschedule mode */}
                  {isRescheduleMode ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for reschedule
                      </label>
                      <textarea
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        placeholder="Let others know why you need to reschedule"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Please share anything that will help prepare for our meeting."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    By proceeding, you agree to our{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md disabled:opacity-50"
                    >
                      {isSubmitting
                        ? isRescheduleMode
                          ? "Rescheduling..."
                          : "Confirming..."
                        : isRescheduleMode
                        ? "Reschedule"
                        : "Confirm"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <span className="text-xl font-bold text-gray-900">Cal.com</span>
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Confirmation Dialog */}
      <AlertDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reschedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reschedule this booking to the new time
              slot? All participants will be notified of the change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReschedule}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Rescheduling..." : "Yes, Reschedule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
