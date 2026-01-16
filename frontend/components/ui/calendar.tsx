"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = Array.from(
    { length: getDaysInMonth(currentMonth) },
    (_, i) => i + 1
  );
  const firstDay = getFirstDayOfMonth(currentMonth);
  const empty = Array.from({ length: firstDay }, (_, i) => i);

  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Check if date is in disabled list
    if (
      disabledDates.some(
        (d) =>
          d.getDate() === day &&
          d.getMonth() === currentMonth.getMonth() &&
          d.getFullYear() === currentMonth.getFullYear()
      )
    ) {
      return true;
    }

    // Check min/max dates
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;

    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    return false;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4 bg-white rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{monthYear}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-neutral-600"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {empty.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => {
              if (!isDateDisabled(day)) {
                onDateSelect(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  )
                );
              }
            }}
            disabled={isDateDisabled(day)}
            className={`
              h-10 rounded-md text-sm font-medium transition-colors
              ${
                isDateSelected(day)
                  ? "bg-neutral-900 text-white"
                  : isDateDisabled(day)
                  ? "text-neutral-300 cursor-not-allowed"
                  : "hover:bg-neutral-100 text-neutral-900"
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
