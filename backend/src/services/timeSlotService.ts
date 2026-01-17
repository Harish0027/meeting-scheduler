import { prisma } from "../db/prisma";
import { timeToMinutes } from "../utils/validations";

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export class TimeSlotService {
  /**
   * Generate available time slots for a given date and event type
   * Handles:
   * - Multiple time ranges per day
   * - Existing bookings
   * - Buffer time
   * - Past time filtering
   * - Timezone conversion
   */
  async generateTimeSlots(
    eventTypeId: string,
    date: Date,
    timezone: string = "UTC"
  ): Promise<TimeSlot[]> {
    // Get event type with schedule
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: {
        schedule: {
          include: { slots: true },
        },
      },
    });

    if (!eventType) {
      throw new Error("Event type not found");
    }

    if (!eventType.isActive) {
      return [];
    }

    if (!eventType.schedule) {
      // Return empty array instead of throwing error
      console.warn(
        `Event type ${eventTypeId} does not have a schedule assigned`
      );
      return [];
    }

    const schedule = eventType.schedule;
    const dayOfWeek = date.getDay();

    // Get availability slots for this day
    const daySlots = schedule.slots.filter((s) => s.dayOfWeek === dayOfWeek);

    if (daySlots.length === 0) {
      return []; // No availability for this day
    }

    // Get existing bookings for this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        userId: eventType.userId,
        status: "confirmed",
        startTime: { gte: dayStart, lte: dayEnd },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate slots for each availability range
    const allSlots: TimeSlot[] = [];
    const now = new Date();
    const bufferMinutes = eventType.bufferTime || 0;
    const durationMinutes = eventType.duration;

    for (const slot of daySlots) {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMin, 0, 0);

      const rangeEnd = new Date(date);
      rangeEnd.setHours(endHour, endMin, 0, 0);

      // Generate 15-minute interval slots
      while (
        currentTime.getTime() + durationMinutes * 60 * 1000 <=
        rangeEnd.getTime()
      ) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(
          currentTime.getTime() + durationMinutes * 60 * 1000
        );

        // Skip past slots
        if (slotStart <= now) {
          currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
          continue;
        }

        // Check buffer times
        const bufferStart = new Date(
          slotStart.getTime() - bufferMinutes * 60 * 1000
        );
        const bufferEnd = new Date(
          slotEnd.getTime() + bufferMinutes * 60 * 1000
        );

        // Check if this slot conflicts with any booking (including buffer)
        const isConflict = bookings.some((booking) => {
          return booking.startTime < bufferEnd && booking.endTime > bufferStart;
        });

        allSlots.push({
          start: slotStart,
          end: slotEnd,
          available: !isConflict,
        });

        // Move to next 15-minute interval
        currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
      }
    }

    // Sort by start time and filter only available
    return allSlots
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .filter((slot) => slot.available);
  }

  /**
   * Get available time slots for a date range
   */
  async getAvailableSlotsForDateRange(
    eventTypeId: string,
    startDate: Date,
    endDate: Date,
    timezone: string = "UTC"
  ): Promise<Record<string, TimeSlot[]>> {
    const slots: Record<string, TimeSlot[]> = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const daySlots = await this.generateTimeSlots(
        eventTypeId,
        new Date(currentDate),
        timezone
      );

      if (daySlots.length > 0) {
        slots[dateKey] = daySlots;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(
    eventTypeId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{ available: boolean; reason?: string }> {
    // Get event type with schedule
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: {
        schedule: {
          include: { slots: true },
        },
      },
    });

    if (!eventType || !eventType.schedule) {
      return { available: false, reason: "Event type or schedule not found" };
    }

    // Check if in past
    if (startTime < new Date()) {
      return { available: false, reason: "Cannot book in the past" };
    }

    // Check if within availability
    const dayOfWeek = startTime.getDay();
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    const daySlots = eventType.schedule.slots.filter(
      (s) => s.dayOfWeek === dayOfWeek
    );

    const isWithinAvailability = daySlots.some((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      return startMinutes >= slotStart && endMinutes <= slotEnd;
    });

    if (!isWithinAvailability) {
      return { available: false, reason: "Outside availability hours" };
    }

    // Check for conflicts with existing bookings
    const bufferMinutes = eventType.bufferTime || 0;
    const bufferStart = new Date(
      startTime.getTime() - bufferMinutes * 60 * 1000
    );
    const bufferEnd = new Date(endTime.getTime() + bufferMinutes * 60 * 1000);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        userId: eventType.userId,
        status: "confirmed",
        startTime: { lt: bufferEnd },
        endTime: { gt: bufferStart },
      },
    });

    if (conflictingBooking) {
      return { available: false, reason: "Time slot already booked" };
    }

    // Check max bookings per day
    if (eventType.maxBookingsPerDay) {
      const dayStart = new Date(startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(startTime);
      dayEnd.setHours(23, 59, 59, 999);

      const bookingsToday = await prisma.booking.count({
        where: {
          eventTypeId: eventType.id,
          status: "confirmed",
          startTime: { gte: dayStart, lte: dayEnd },
        },
      });

      if (bookingsToday >= eventType.maxBookingsPerDay) {
        return {
          available: false,
          reason: `Maximum bookings per day (${eventType.maxBookingsPerDay}) reached`,
        };
      }
    }

    return { available: true };
  }
}

export const timeSlotService = new TimeSlotService();
