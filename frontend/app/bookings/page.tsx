"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { apiClient } from "@/lib/api";
import {
  Video,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  XCircle,
  Pencil,
  Clock,
  MapPin,
  UserPlus,
  Info,
  Flag,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  bookerName: string;
  bookerEmail: string;
  eventType: {
    id: string;
    title: string;
    duration: number;
  };
  user?: {
    username: string;
    email: string;
  };
}

type TabType = "upcoming" | "unconfirmed" | "recurring" | "past" | "canceled";

const TABS: { key: TabType; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "unconfirmed", label: "Unconfirmed" },
  { key: "recurring", label: "Recurring" },
  { key: "past", label: "Past" },
  { key: "canceled", label: "Canceled" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      const response = await apiClient.get<Booking[]>("/bookings");
      if (response.success && response.data) {
        setBookings(response.data);
      }
      setIsLoading(false);
    };

    loadBookings();
  }, []);

  const handleCancel = async (booking: Booking) => {
    setActiveMenu(null);
    if (confirm("Are you sure you want to cancel this booking?")) {
      const response = await apiClient.put(`/bookings/${booking.id}/cancel`);
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: "cancelled" } : b
          )
        );
        toast.success("Booking cancelled");
      } else {
        toast.error("Failed to cancel booking");
      }
    }
  };

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      switch (activeTab) {
        case "upcoming":
          return bookingDate >= now && booking.status === "confirmed";
        case "unconfirmed":
          return booking.status === "pending";
        case "past":
          return bookingDate < now;
        case "canceled":
          return booking.status === "cancelled";
        case "recurring":
          return false;
        default:
          return true;
      }
    });
  }, [bookings, activeTab]);

  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: { date: Date; bookings: Booking[] } } = {};
    
    filteredBookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      const dateKey = date.toISOString().split("T")[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = { date, bookings: [] };
      }
      groups[dateKey].bookings.push(booking);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, group]) => group);
  }, [filteredBookings]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    let count = 0;
    const result: typeof groupedBookings = [];
    
    for (const group of groupedBookings) {
      if (count >= end) break;
      if (count + group.bookings.length > start) {
        result.push(group);
      }
      count += group.bookings.length;
    }
    
    return result;
  }, [groupedBookings, currentPage, rowsPerPage]);

  const totalBookings = filteredBookings.length;
  const totalPages = Math.ceil(totalBookings / rowsPerPage);

  const getGroupTitle = (groupDate: Date, index: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(groupDate);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "TODAY";
    }
    
    // Find if this is the first group AFTER today
    // Since paginatedGroups is sorted by date
    // We can just check if the previous group was today or in the past
    // But paginatedGroups only contains visible groups. 
    // Simplified logic as per standard Cal.com UI:
    // If it's the first group in the list and not today -> NEXT (if it is upcoming)
    // Or closer match to screenshot:
    // Iterate through all groups and label the first non-today group as NEXT?
    
    // Let's stick to simple logic that usually works well:
    // If we are in "Upcoming" tab:
    // The groups are sorted ascending.
    // 1st group -> TODAY (if match)
    // 2nd group (or 1st if today empty) -> NEXT
    
    if (activeTab === "upcoming") {
        const isToday = paginatedGroups.some(g => {
            const gDate = new Date(g.date);
            gDate.setHours(0,0,0,0);
            return gDate.getTime() === today.getTime();
        });

        // If this group is NOT today
        if (date.getTime() !== today.getTime()) {
             // If there is a today group, and this is the one right after it
             const todayIndex = paginatedGroups.findIndex(g => {
                 const gDate = new Date(g.date);
                 gDate.setHours(0,0,0,0);
                 return gDate.getTime() === today.getTime();
             });
             
             if (index === todayIndex + 1 || (todayIndex === -1 && index === 0)) {
                 return "NEXT";
             }
        }
    }

    return formatDate(groupDate).toUpperCase();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "TODAY";
    }

    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .toUpperCase()
      .replace(",", "");
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase(); // match screenshot "4:30pm"
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
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
        <h1 className="text-xl font-bold text-neutral-900">Bookings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 lg:px-8 border-b border-neutral-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-px -mb-px scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto pl-4">
            <button className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border border-neutral-200 rounded-md text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-md text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
              Saved filters
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 border border-neutral-200 rounded-lg">
            <Calendar className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-sm font-medium text-neutral-900 mb-1">
              No bookings found
            </h3>
            <p className="text-sm text-neutral-500">
              {activeTab === "upcoming"
                ? "You have no upcoming bookings."
                : `No ${activeTab} bookings to show.`}
            </p>
          </div>
        ) : (
          <>
            {/* Bookings Table */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              {paginatedGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Header */}
                  <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      {getGroupTitle(group.date, groupIndex)}
                    </span>
                  </div>

                  {/* Bookings for this date */}
                  {group.bookings.map((booking, bookingIndex) => (
                    <div
                      key={booking.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-neutral-50 transition-colors ${
                        bookingIndex < group.bookings.length - 1
                          ? "border-b border-neutral-100"
                          : ""
                      }`}
                    >
                      {/* Date & Time */}
                      <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:w-28 flex-shrink-0">
                        <span className="text-sm font-medium text-neutral-900">
                          {formatDateShort(booking.startTime)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </span>
                      </div>

                      {/* Video Link */}
                      <div className="flex items-center gap-2 sm:w-32 flex-shrink-0">
                        <Video className="w-4 h-4 text-neutral-400" />
                        <a
                          href="#"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Join Cal Video
                        </a>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <a href="#" className="text-sm font-medium text-neutral-900 hover:underline truncate block">
                          {booking.eventType.title} between{" "}
                          <span className="text-neutral-900">{booking.bookerName}</span> and{" "}
                          <span className="text-neutral-900">{booking.bookerName}</span>
                        </a>
                        {booking.notes && (
                          <p className="text-xs text-neutral-500 truncate mt-0.5 italic">
                            "{booking.notes}"
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-0.5">
                          You and {booking.bookerName}
                        </p>
                      </div>

                      {/* Attendees */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white font-medium">Y</span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {booking.bookerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-neutral-500 hidden sm:inline">+2</span>
                      </div>

                      {/* More Actions */}
                      <div className="relative ml-auto" ref={activeMenu === booking.id ? menuRef : null}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === booking.id ? null : booking.id);
                            }}
                            className="p-2 hover:bg-neutral-100 rounded-md transition-colors text-neutral-500"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                         {activeMenu === booking.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                             <div className="px-3 py-2 text-xs font-semibold text-gray-500">Edit event</div>
                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                                <Clock className="w-4 h-4 text-neutral-500" />
                                Reschedule booking
                             </button>
                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                                <Pencil className="w-4 h-4 text-neutral-500" />
                                Edit location
                             </button>
                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                                <UserPlus className="w-4 h-4 text-neutral-500" />
                                Add guests
                             </button>

                             <div className="my-1 border-t border-neutral-100" />
                             
                             <div className="px-3 py-2 text-xs font-semibold text-gray-500">After event</div>
                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                                <Video className="w-4 h-4 text-neutral-500" />
                                View recordings
                             </button>
                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                                <Info className="w-4 h-4 text-neutral-500" />
                                View session details
                             </button>
                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                                <Ban className="w-4 h-4 text-neutral-500" />
                                Mark as no-show
                             </button>

                             <div className="my-1 border-t border-neutral-100" />

                             <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                                <Flag className="w-4 h-4" />
                                Report booking
                             </button>
                             <button 
                                onClick={() => handleCancel(booking)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                             >
                                <XCircle className="w-4 h-4" />
                                Cancel event
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <span className="text-neutral-600">Rows per page</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none border border-neutral-200 rounded-md px-2 py-1 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-4 order-1 sm:order-2">
                <span className="text-neutral-600">
                  {Math.min((currentPage - 1) * rowsPerPage + 1, totalBookings)}-
                  {Math.min(currentPage * rowsPerPage, totalBookings)} of{" "}
                  {totalBookings}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
