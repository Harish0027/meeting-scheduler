import { prisma } from "../db/prisma";
import { CreateEventTypeInput, UpdateEventTypeInput } from "../validators";

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

    return prisma.eventType.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getEventTypeById(id: string) {
    return prisma.eventType.findUnique({
      where: { id },
    });
  }

  async getEventTypeBySlug(userId: string, slug: string) {
    return prisma.eventType.findUnique({
      where: {
        userId_slug: { userId, slug },
      },
    });
  }

  async getEventTypesByUserId(userId: string) {
    return prisma.eventType.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateEventType(id: string, data: UpdateEventTypeInput) {
    return prisma.eventType.update({
      where: { id },
      data,
    });
  }

  async deleteEventType(id: string) {
    return prisma.eventType.delete({
      where: { id },
    });
  }
}

export const eventTypeService = new EventTypeService();
