"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Clock, Mail, ArrowRight } from "lucide-react";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const eventTitle = searchParams.get("eventTitle") || "Your Event";
  const guestEmail = searchParams.get("email") || "";
  const bookingTime = searchParams.get("time") || "";
  const duration = searchParams.get("duration") || "30";

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-neutral-600 text-lg">
            Your meeting has been scheduled successfully.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8 space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-neutral-600">Event Type</p>
              <p className="text-base font-semibold text-neutral-900">
                {eventTitle}
              </p>
            </div>
          </div>

          {bookingTime && (
            <div className="flex items-start gap-3 border-t border-neutral-100 pt-4">
              <Clock className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-neutral-600">Scheduled Time</p>
                <p className="text-base font-semibold text-neutral-900">
                  {bookingTime}
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  Duration: {duration} minutes
                </p>
              </div>
            </div>
          )}

          {guestEmail && (
            <div className="flex items-start gap-3 border-t border-neutral-100 pt-4">
              <Mail className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-neutral-600">Confirmation Email</p>
                <p className="text-base font-semibold text-neutral-900">
                  {guestEmail}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            A confirmation email with meeting details has been sent to your
            email address. Please check your inbox and spam folder.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white gap-2">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-10 border-neutral-200 hover:bg-neutral-100"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Footer Message */}
        <p className="text-center text-sm text-neutral-600 mt-8">
          Questions? Contact support at{" "}
          <a
            href="mailto:support@cal.com"
            className="text-neutral-900 font-semibold hover:underline"
          >
            support@cal.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-neutral-600">Loading...</p>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
