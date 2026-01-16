import { prisma } from "../db/prisma";
import { SetAvailabilityInput } from "../validators";

export class AvailabilityService {
  async setAvailability(userId: string, data: SetAvailabilityInput) {
    // Validate time format
    this.validateTimeFormat(data.startTime);
    this.validateTimeFormat(data.endTime);
    this.validateTimeRange(data.startTime, data.endTime);

    return prisma.availability.upsert({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek: data.dayOfWeek,
        },
      },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }

  async getAvailabilityByUserId(userId: string) {
    return prisma.availability.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async deleteAvailability(userId: string, dayOfWeek: number) {
    return prisma.availability.delete({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek,
        },
      },
    });
  }

  private validateTimeFormat(time: string): void {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
      throw new Error(`Invalid time format: ${time}. Use HH:MM`);
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (startTotalMin >= endTotalMin) {
      throw new Error("Start time must be before end time");
    }
  }
}

export const availabilityService = new AvailabilityService();
