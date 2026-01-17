import { prisma } from "../db/prisma";
import { getCache, setCache, invalidateCache } from "../utils/redis";
import {
  CreateBookingInput,
  RescheduleBookingInput,
  UpdateBookingLocationInput,
  AddBookingGuestsInput,
} from "../validators";
import { eventTypeService } from "./eventTypeService";
import { userService } from "./userService";
import {
  validateBookingWithinAvailability,
  validateBookingNotInPast,
  doBookingsOverlap,
} from "../utils/validations";

export class BookingService {
  /**
   * Validates that the requester owns the booking
   * Only the booker (creator) can modify their booking
   */
  private async validateBookingOwnership(
    bookingId: string,
    bookerEmail: string
  ): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { bookerEmail: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.bookerEmail.toLowerCase() !== bookerEmail.toLowerCase()) {
      throw new Error("Forbidden: You can only modify your own bookings");
    }
  }

  async createBooking(userId: string, data: CreateBookingInput) {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate event type exists and is active
    const eventType = await prisma.eventType.findUnique({
      where: { id: data.eventTypeId },
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
      throw new Error("Event type is not active");
    }

    if (!eventType.schedule) {
      throw new Error("Event type does not have an availability schedule");
    }

    // Parse times
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Validate not in past
    if (!validateBookingNotInPast(startTime)) {
      throw new Error("Cannot book in the past");
    }

    // Validate duration matches event type
    const bookingDuration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (Math.abs(bookingDuration - eventType.duration) > 1) {
      throw new Error(
        `Booking duration must match event type duration (${eventType.duration} minutes)`
      );
    }

    // Validate booking is within availability
    const availabilityCheck = validateBookingWithinAvailability(
      startTime,
      endTime,
      eventType.schedule.slots,
      eventType.schedule.timezone
    );

    if (!availabilityCheck.valid) {
      throw new Error(
        availabilityCheck.error || "Booking is outside availability"
      );
    }

    // Check for overlapping bookings (prevent double booking)
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: "confirmed",
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlappingBookings.length > 0) {
      throw new Error("This time slot overlaps with an existing booking");
    }

    // Check max bookings per day if set
    if (eventType.maxBookingsPerDay) {
      const dayStart = new Date(startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(startTime);
      dayEnd.setHours(23, 59, 59, 999);

      const bookingsToday = await prisma.booking.count({
        where: {
          eventTypeId: eventType.id,
          status: "confirmed",
          startTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (bookingsToday >= eventType.maxBookingsPerDay) {
        throw new Error(
          `Maximum bookings per day (${eventType.maxBookingsPerDay}) reached`
        );
      }
    }

    // Check buffer time
    if (eventType.bufferTime > 0) {
      const bufferMs = eventType.bufferTime * 60 * 1000;
      const bufferStart = new Date(startTime.getTime() - bufferMs);
      const bufferEnd = new Date(endTime.getTime() + bufferMs);

      const bufferConflict = await prisma.booking.findFirst({
        where: {
          userId,
          status: "confirmed",
          OR: [
            {
              startTime: { lt: bufferEnd },
              endTime: { gt: bufferStart },
            },
          ],
        },
      });

      if (bufferConflict) {
        throw new Error(
          `Buffer time conflict: ${eventType.bufferTime} minutes required before/after meetings`
        );
      }
    }

    // Validate location requirements
    if (data.location === "in-person" && !data.locationValue) {
      throw new Error("Location address is required for in-person meetings");
    }
    if (data.location === "phone" && !data.locationValue) {
      throw new Error("Phone number is required for phone meetings");
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId,
        bookerName: data.bookerName,
        bookerEmail: data.bookerEmail,
        bookerPhone: data.bookerPhone,
        startTime,
        endTime,
        timeZone: data.timeZone,
        location: data.location,
        locationValue: data.locationValue,
        guests: data.guests || [],
        notes: data.notes,
        status: "confirmed",
      },
      include: {
        eventType: {
          include: {
            schedule: {
              include: { slots: true },
            },
          },
        },
      },
    });
    await invalidateCache(`bookings:user:${userId}:`);
    return booking;
  }

  async getBookingById(id: string) {
    const cacheKey = `booking:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    if (booking) await setCache(cacheKey, booking, 120);
    return booking;
  }

  async getBookingsByUserId(
    userId: string,
    filters?: {
      status?: string;
      attendeeName?: string;
      attendeeEmail?: string;
      eventTypeId?: string;
      dateFrom?: string;
      dateTo?: string;
      bookingUid?: string;
    }
  ) {
    const cacheKey = `bookings:user:${userId}:` + JSON.stringify(filters || {});
    const cached = await getCache(cacheKey);
    if (cached) return cached;
    const where: any = { userId };

    if (filters?.status) {
      if (filters.status === "upcoming") {
        where.status = "confirmed";
        where.startTime = { gte: new Date() };
      } else if (filters.status === "past") {
        where.startTime = { lt: new Date() };
      } else if (
        filters.status === "cancelled" ||
        filters.status === "canceled"
      ) {
        where.status = "cancelled";
      } else if (filters.status === "unconfirmed") {
        where.status = "pending";
      }
    }

    if (filters?.attendeeName) {
      where.bookerName = {
        contains: filters.attendeeName,
        mode: "insensitive",
      };
    }

    if (filters?.attendeeEmail) {
      where.bookerEmail = {
        contains: filters.attendeeEmail,
        mode: "insensitive",
      };
    }

    if (filters?.eventTypeId) {
      where.eventTypeId = filters.eventTypeId;
    }

    if (filters?.bookingUid) {
      where.id = filters.bookingUid;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.startTime = where.startTime || {};
      if (filters?.dateFrom) {
        where.startTime.gte = new Date(filters.dateFrom);
      }
      if (filters?.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.startTime.lte = endDate;
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        eventType: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: filters?.status === "upcoming" ? "asc" : "desc" },
    });
    await setCache(cacheKey, bookings, 60);
    return bookings;
  }

  async getUpcomingBookings(userId: string) {
    return this.getBookingsByUserId(userId, { status: "upcoming" });
  }

  async getPastBookings(userId: string) {
    return this.getBookingsByUserId(userId, { status: "past" });
  }

  async cancelBooking(bookingId: string, bookerEmail: string) {
    // Validate ownership - only the booker can cancel
    await this.validateBookingOwnership(bookingId, bookerEmail);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    // Only allow canceling future bookings
    if (booking.startTime < new Date()) {
      throw new Error("Cannot cancel past bookings");
    }

    // Fetch booking to get userId for cache invalidation (we already fetched above as `booking`)
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
      include: {
        eventType: true,
      },
    });
    // Invalidate cache for this booking and user bookings list
    await invalidateCache(`booking:${bookingId}`);
    if (booking && booking.userId) {
      await invalidateCache(`bookings:user:${booking.userId}:`);
    }
    return updated;
  }

  async rescheduleBooking(
    bookingId: string,
    bookerEmail: string,
    data: RescheduleBookingInput
  ) {
    // Validate ownership - only the booker can reschedule
    await this.validateBookingOwnership(bookingId, bookerEmail);
    // Get the existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { eventType: true },
    });

    if (!existingBooking) {
      throw new Error("Booking not found");
    }

    if (existingBooking.status === "cancelled") {
      throw new Error("Cannot reschedule a cancelled booking");
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Check for conflicting bookings (excluding the current one)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        eventTypeId: existingBooking.eventTypeId,
        status: "confirmed",
        id: { not: bookingId },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new Error("This time slot is already booked");
    }

    // Update the booking with new times
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        startTime,
        endTime,
        status: "rescheduled",
        notes: data.rescheduleReason
          ? `[Rescheduled] ${data.rescheduleReason}${
              existingBooking.notes
                ? `\n\nOriginal notes: ${existingBooking.notes}`
                : ""
            }`
          : existingBooking.notes,
      },
      include: {
        eventType: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async updateBookingLocation(
    bookingId: string,
    data: UpdateBookingLocationInput
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled") {
      throw new Error("Cannot update a cancelled booking");
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        location: data.location,
        locationValue: data.locationValue || null,
      },
      include: {
        eventType: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async addBookingGuests(bookingId: string, data: AddBookingGuestsInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled") {
      throw new Error("Cannot update a cancelled booking");
    }

    // Merge existing guests with new ones (avoid duplicates)
    const existingGuests = booking.guests || [];
    const allGuests = [...new Set([...existingGuests, ...data.guests])];

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        guests: allGuests,
      },
      include: {
        eventType: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }
}

export const bookingService = new BookingService();
