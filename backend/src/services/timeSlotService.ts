import { prisma } from "../db/prisma";
import { availabilityService } from "./availabilityService";

export class TimeSlotService {
  /**
   * Generate available time slots for a given date
   */
  async generateTimeSlots(
    userId: string,
    eventTypeId: string,
    date: Date,
    bufferMinutes: number = 0
  ) {
    // Get event type to know duration
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      throw new Error("Event type not found");
    }

    // Get user availability
    const availabilities = await availabilityService.getAvailabilityByUserId(
      userId
    );

    const dayOfWeek = date.getDay();
    const availability = availabilities.find((a) => a.dayOfWeek === dayOfWeek);

    if (!availability) {
      return []; // No availability for this day
    }

    // Get existing bookings for this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        eventTypeId,
        status: "confirmed",
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
    });

    // Generate slots
    const slots: { start: Date; end: Date }[] = [];
    const [startHour, startMin] = availability.startTime.split(":").map(Number);
    const [endHour, endMin] = availability.endTime.split(":").map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMin, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMin, 0, 0);

    let currentTime = slotStart;

    while (
      currentTime.getTime() + eventType.duration * 60 * 1000 <=
      slotEnd.getTime()
    ) {
      const slotEndTime = new Date(
        currentTime.getTime() + eventType.duration * 60 * 1000
      );
      const bufferEnd = new Date(
        slotEndTime.getTime() + bufferMinutes * 60 * 1000
      );

      // Check if this slot conflicts with any booking
      const isConflict = bookings.some(
        (booking) =>
          booking.startTime < bufferEnd && booking.endTime > currentTime
      );

      if (!isConflict) {
        slots.push({
          start: currentTime,
          end: slotEndTime,
        });
      }

      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // 15-minute intervals
    }

    return slots;
  }
}

export const timeSlotService = new TimeSlotService();
