"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Calendar, Clock, Users, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  attendeeName: string;
  eventType: {
    title: string;
    duration: number;
  };
}

interface EventType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  isActive: boolean;
}

export default function DashboardPage() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [bookingsRes, eventTypesRes] = await Promise.all([
        apiClient.get<Booking[]>("/bookings"),
        apiClient.get<EventType[]>("/event-types"),
      ]);

      if (bookingsRes.success && bookingsRes.data) {
        const now = new Date();
        const upcoming = bookingsRes.data
          .filter((b) => new Date(b.startTime) >= now && b.status === "confirmed")
          .slice(0, 5);
        setUpcomingBookings(upcoming);
      }

      if (eventTypesRes.success && eventTypesRes.data) {
        setEventTypes(eventTypesRes.data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

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
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s an overview of your scheduling activity.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{upcomingBookings.length}</p>
                <p className="text-xs text-gray-500">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{eventTypes.length}</p>
                <p className="text-xs text-gray-500">Event Types</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{eventTypes.filter(e => e.isActive).length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Bookings */}
          <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Upcoming Bookings</h2>
              <Link
                href="/bookings"
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingBookings.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No upcoming bookings</p>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.eventType.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          with {booking.attendeeName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">
                          {formatDate(booking.startTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(booking.startTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/event-types/new"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Plus className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Create Event Type</p>
                  <p className="text-xs text-gray-500">Add a new scheduling link</p>
                </div>
              </Link>
              <Link
                href="/availability"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Set Availability</p>
                  <p className="text-xs text-gray-500">Configure your working hours</p>
                </div>
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">View Bookings</p>
                  <p className="text-xs text-gray-500">See all your scheduled meetings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
