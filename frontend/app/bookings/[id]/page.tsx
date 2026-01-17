"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { apiClient } from "@/lib/api";
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
import toast from "react-hot-toast";

interface Booking {
  id: string;
  uid?: string;
  eventType: {
    id: string;
    title: string;
    duration: number;
    slug: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
  bookerName: string;
  bookerEmail: string;
  bookerPhone?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  location: string;
  locationValue?: string;
  guests?: string[];
  notes?: string;
  status: string;
}

export default function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      const response = await apiClient.get<Booking>(`/bookings/${id}`);
      if (response.success && response.data) {
        console.log("Booking data:", response.data);
        setBooking(response.data);
      }
      setIsLoading(false);
    };

    loadBooking();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLocationDisplay = () => {
    if (!booking) return "";
    if (booking.location === "meet") return "Cal Video";
    if (booking.location === "phone") return booking.locationValue || "Phone";
    if (booking.location === "in-person")
      return booking.locationValue || "In Person";
    return booking.location;
  };

  const handleReschedule = () => {
    if (!booking || !booking.user) return;
    const rescheduleUrl = `/${booking.user.username}/${
      booking.eventType.slug
    }?rescheduleUid=${booking.id}&rescheduledBy=${encodeURIComponent(
      booking.bookerEmail
    )}`;
    router.push(rescheduleUrl);
  };

  const handleCancel = async () => {
    if (!booking) return;

    if (!booking.bookerEmail) {
      toast.error("Unable to cancel: Booker email not found");
      return;
    }

    setIsCanceling(true);

    try {
      const response = await apiClient.put(`/bookings/${booking.id}/cancel`, {
        bookerEmail: booking.bookerEmail,
      });

      if (response.success) {
        toast.success("Booking cancelled successfully");
        setShowCancelDialog(false);
        router.push("/bookings");
      } else {
        toast.error(response.error?.message || "Failed to cancel booking");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-neutral-600">Booking not found</p>
        </div>
      </div>
    );
  }

  const isCancelled = booking?.status === "cancelled";

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/bookings")}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to bookings</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {isCancelled ? (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
            {isCancelled
              ? "This event is canceled"
              : "This meeting is scheduled"}
          </h1>
          {!isCancelled && (
            <p className="text-center text-neutral-600 mb-8">
              We sent an email with a calendar invitation with the details to
              everyone.
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-neutral-200 my-8" />

          {/* Meeting Details */}
          <div className="space-y-6">
            {/* Cancellation Info */}
            {isCancelled && (
              <>
                <div className="flex gap-6">
                  <div className="w-32 shrink-0">
                    <span className="text-neutral-600 font-medium">Reason</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900">just canceled</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-32 shrink-0">
                    <span className="text-neutral-600 font-medium">
                      Cancelled By
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900">{booking.bookerEmail}</p>
                  </div>
                </div>
              </>
            )}

            {/* What */}
            <div className="flex gap-6">
              <div className={isCancelled ? "w-32 shrink-0" : "w-20 shrink-0"}>
                <span className="text-neutral-600 font-medium">What</span>
              </div>
              <div className="flex-1">
                <p className="text-neutral-900">
                  {booking.eventType.duration} min meeting between{" "}
                  {booking.user?.username || "Host"} and {booking.bookerName}
                </p>
              </div>
            </div>

            {/* When */}
            <div className="flex gap-6">
              <div className={isCancelled ? "w-32 shrink-0" : "w-20 shrink-0"}>
                <span className="text-neutral-600 font-medium">When</span>
              </div>
              <div className="flex-1">
                <p
                  className={
                    isCancelled
                      ? "text-neutral-900 line-through"
                      : "text-neutral-900"
                  }
                >
                  {formatDate(booking.startTime)}
                </p>
                <p
                  className={
                    isCancelled
                      ? "text-neutral-600 line-through"
                      : "text-neutral-600"
                  }
                >
                  {formatTime(booking.startTime)} -{" "}
                  {formatTime(booking.endTime)}{" "}
                  {booking.timeZone
                    ? `(${booking.timeZone})`
                    : "(India Standard Time)"}
                </p>
              </div>
            </div>

            {/* Who */}
            <div className="flex gap-6">
              <div className={isCancelled ? "w-32 shrink-0" : "w-20 shrink-0"}>
                <span className="text-neutral-600 font-medium">Who</span>
              </div>
              <div className="flex-1 space-y-3">
                {booking.user && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-900 font-medium">
                        {booking.user.username}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                        Host
                      </span>
                    </div>
                    <p className="text-neutral-600 text-sm">
                      {booking.user.email}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-neutral-900 font-medium">
                    {booking.bookerName}
                  </p>
                  <p className="text-neutral-600 text-sm">
                    {booking.bookerEmail}
                  </p>
                </div>
                {booking.guests && booking.guests.length > 0 && (
                  <>
                    {booking.guests.map((guest, idx) => (
                      <div key={idx}>
                        <p className="text-neutral-600 text-sm">{guest}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Where - Hide for cancelled */}
            {!isCancelled && (
              <div className="flex gap-6">
                <div className="w-20 shrink-0">
                  <span className="text-neutral-600 font-medium">Where</span>
                </div>
                <div className="flex-1">
                  <a
                    href="#"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {getLocationDisplay()}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {booking.notes && !isCancelled && (
              <>
                {/* Notes */}
                <div className="flex gap-6">
                  <div className="w-20 shrink-0">
                    <span className="text-neutral-600 font-medium">Notes</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900">{booking.notes}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions - Only for active bookings */}
          {!isCancelled && (
            <>
              {/* Divider */}
              <div className="border-t border-neutral-200 my-8" />

              <div className="text-center">
                <p className="text-neutral-600 mb-4">Need to make a change?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleReschedule}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Reschedule
                  </button>
                  <span className="text-neutral-400">or</span>
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone and all participants will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? "Canceling..." : "Yes, cancel booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
