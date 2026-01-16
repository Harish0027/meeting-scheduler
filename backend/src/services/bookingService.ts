import { prisma } from "../db/prisma";
import { CreateBookingInput } from "../validators";
import { eventTypeService } from "./eventTypeService";
import { availabilityService } from "./availabilityService";
import { userService } from "./userService";

export class BookingService {
  async createBooking(userId: string, data: CreateBookingInput) {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate event type exists
    const eventType = await eventTypeService.getEventTypeBySlug(
      userId,
      data.eventTypeSlug
    );
    if (!eventType) {
      throw new Error("Event type not found");
    }

    // Check for double booking
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        eventTypeId: eventType.id,
        status: "confirmed",
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

    // Create booking
    return prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId,
        bookerName: data.bookerName,
        bookerEmail: data.bookerEmail,
        bookerPhone: data.bookerPhone,
        startTime,
        endTime,
        notes: data.notes,
      },
      include: {
        eventType: true,
      },
    });
  }

  async getBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: true,
      },
    });
  }

  async getBookingsByUserId(userId: string, status?: string) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return prisma.booking.findMany({
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
      orderBy: { startTime: "desc" },
    });
  }

  async getUpcomingBookings(userId: string) {
    return prisma.booking.findMany({
      where: {
        userId,
        status: "confirmed",
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        eventType: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  async getPastBookings(userId: string) {
    return prisma.booking.findMany({
      where: {
        userId,
        startTime: {
          lt: new Date(),
        },
      },
      include: {
        eventType: true,
      },
      orderBy: { startTime: "desc" },
    });
  }

  async cancelBooking(bookingId: string) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
      include: {
        eventType: true,
      },
    });
  }
}

export const bookingService = new BookingService();
