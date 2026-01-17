import { z } from "zod";

/**
 * Validates that end time is greater than start time
 */
export function validateTimeRange(startTime: string, endTime: string): boolean {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes > startMinutes;
}

/**
 * Converts HH:MM time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hour, min] = time.split(":").map(Number);
  return hour * 60 + min;
}

/**
 * Validates that time slots for a day don't overlap
 */
export function validateNoOverlappingSlots(
  slots: Array<{ startTime: string; endTime: string }>
): { valid: boolean; error?: string } {
  // Sort slots by start time
  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Check for overlaps
  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const currentEnd = timeToMinutes(sortedSlots[i].endTime);
    const nextStart = timeToMinutes(sortedSlots[i + 1].startTime);

    if (currentEnd > nextStart) {
      return {
        valid: false,
        error: `Time slots overlap: ${sortedSlots[i].startTime}-${
          sortedSlots[i].endTime
        } and ${sortedSlots[i + 1].startTime}-${sortedSlots[i + 1].endTime}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates that at least one day is active (has slots)
 */
export function validateAtLeastOneActiveDay(
  slots: Array<{ dayOfWeek: number }>
): boolean {
  return slots.length > 0;
}

/**
 * Validates timezone string
 */
export function validateTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates all schedule slots
 */
export function validateScheduleSlots(
  slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check at least one active day
  if (!validateAtLeastOneActiveDay(slots)) {
    errors.push("At least one day must be active");
  }

  // Group slots by day
  const slotsByDay: Record<number, typeof slots> = {};
  for (const slot of slots) {
    if (!slotsByDay[slot.dayOfWeek]) {
      slotsByDay[slot.dayOfWeek] = [];
    }
    slotsByDay[slot.dayOfWeek].push(slot);
  }

  // Validate each day
  for (const [day, daySlots] of Object.entries(slotsByDay)) {
    for (const slot of daySlots) {
      // Validate time range
      if (!validateTimeRange(slot.startTime, slot.endTime)) {
        errors.push(
          `Day ${day}: End time (${slot.endTime}) must be greater than start time (${slot.startTime})`
        );
      }
    }

    // Validate no overlaps
    const overlapCheck = validateNoOverlappingSlots(daySlots);
    if (!overlapCheck.valid) {
      errors.push(`Day ${day}: ${overlapCheck.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates event type duration fits in availability slots
 */
export function validateDurationFitsInSlots(
  durationMinutes: number,
  slots: Array<{ startTime: string; endTime: string }>
): boolean {
  for (const slot of slots) {
    const slotDuration =
      timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    if (slotDuration >= durationMinutes) {
      return true;
    }
  }
  return false;
}

/**
 * Validates that a booking time is within availability
 */
export function validateBookingWithinAvailability(
  bookingStart: Date,
  bookingEnd: Date,
  availabilitySlots: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>,
  timezone: string
): { valid: boolean; error?: string } {
  // Get day of week (0 = Sunday)
  const dayOfWeek = bookingStart.getDay();

  // Find slots for this day
  const daySlots = availabilitySlots.filter((s) => s.dayOfWeek === dayOfWeek);

  if (daySlots.length === 0) {
    return {
      valid: false,
      error: "No availability on this day of week",
    };
  }

  // Extract time from booking
  const bookingStartMinutes =
    bookingStart.getHours() * 60 + bookingStart.getMinutes();
  const bookingEndMinutes =
    bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

  // Check if booking fits in any slot
  for (const slot of daySlots) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    if (bookingStartMinutes >= slotStart && bookingEndMinutes <= slotEnd) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    error: "Booking time is outside available slots for this day",
  };
}

/**
 * Validates that booking is not in the past
 */
export function validateBookingNotInPast(startTime: Date): boolean {
  return startTime > new Date();
}

/**
 * Checks if two time ranges overlap
 */
export function doBookingsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Zod schemas for internal validation only
 * Main schemas are in validators/index.ts
 */
export const scheduleSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().optional(),
  isDefault: z.boolean().optional(),
  slots: z.array(scheduleSlotSchema).optional(),
});
