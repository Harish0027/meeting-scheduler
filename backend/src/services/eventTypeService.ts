import { prisma } from "../db/prisma";
import { CreateEventTypeInput, UpdateEventTypeInput } from "../validators";
import { validateDurationFitsInSlots } from "../utils/validations";

export class EventTypeService {
  async createEventType(userId: string, data: CreateEventTypeInput) {
    // Check if slug already exists for this user
    const existing = await prisma.eventType.findUnique({
      where: {
        userId_slug: { userId, slug: data.slug },
      },
    });

    if (existing) {
      throw new Error("Event type with this slug already exists");
    }

    // Validate location-specific requirements
    if (data.location === "in-person" && !data.locationValue) {
      throw new Error("Location address is required for in-person meetings");
    }
    if (data.location === "phone" && !data.locationValue) {
      throw new Error("Phone number is required for phone meetings");
    }

    // If scheduleId provided, validate it exists and duration fits
    if (data.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: data.scheduleId },
        include: { slots: true },
      });

      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // Validate that schedule belongs to user
      if (schedule.userId !== userId) {
        throw new Error("Schedule does not belong to this user");
      }

      // Validate duration fits in availability slots
      if (schedule.slots.length > 0) {
        const durationFits = validateDurationFitsInSlots(
          data.duration,
          schedule.slots
        );
        if (!durationFits) {
          throw new Error(
            `Event duration (${data.duration} minutes) does not fit in any availability slot`
          );
        }
      }
    }

    return prisma.eventType.create({
      data: {
        ...data,
        userId,
      },
      include: {
        schedule: {
          include: { slots: true },
        },
      },
    });
  }

  async getEventTypeById(id: string) {
    return prisma.eventType.findUnique({
      where: { id },
      include: {
        schedule: {
          include: { slots: true },
        },
      },
    });
  }

  async getEventTypeBySlug(userId: string, slug: string) {
    return prisma.eventType.findUnique({
      where: {
        userId_slug: { userId, slug },
      },
      include: {
        user: true,
        schedule: {
          include: { slots: true },
        },
      },
    });
  }

  async getEventTypesByUserId(userId: string) {
    return prisma.eventType.findMany({
      where: { userId },
      include: {
        schedule: {
          include: { slots: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateEventType(id: string, data: UpdateEventTypeInput) {
    // Validate location-specific requirements
    if (data.location === "in-person" && !data.locationValue) {
      throw new Error("Location address is required for in-person meetings");
    }
    if (data.location === "phone" && !data.locationValue) {
      throw new Error("Phone number is required for phone meetings");
    }

    // If scheduleId being changed, validate it
    if (data.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: data.scheduleId },
        include: { slots: true },
      });

      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // If duration is being updated or schedule changed, validate fit
      const eventType = await prisma.eventType.findUnique({
        where: { id },
      });

      if (!eventType) {
        throw new Error("Event type not found");
      }

      const durationToCheck = data.duration || eventType.duration;
      if (schedule.slots.length > 0) {
        const durationFits = validateDurationFitsInSlots(
          durationToCheck,
          schedule.slots
        );
        if (!durationFits) {
          throw new Error(
            `Event duration (${durationToCheck} minutes) does not fit in any availability slot`
          );
        }
      }
    }

    return prisma.eventType.update({
      where: { id },
      data,
      include: {
        schedule: {
          include: { slots: true },
        },
      },
    });
  }

  async deleteEventType(id: string) {
    // Check if there are any upcoming bookings
    const upcomingBookings = await prisma.booking.count({
      where: {
        eventTypeId: id,
        startTime: { gte: new Date() },
        status: "confirmed",
      },
    });

    if (upcomingBookings > 0) {
      throw new Error(
        `Cannot delete event type with ${upcomingBookings} upcoming booking(s)`
      );
    }

    return prisma.eventType.delete({
      where: { id },
    });
  }
}

export const eventTypeService = new EventTypeService();
