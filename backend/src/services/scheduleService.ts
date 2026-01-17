import { prisma } from "../db/prisma";
import {
  validateScheduleSlots,
  validateTimezone,
  createScheduleSchema,
} from "../utils/validations";

interface ScheduleSlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface CreateScheduleInput {
  name: string;
  timezone?: string;
  isDefault?: boolean;
  slots?: ScheduleSlotInput[];
}

interface UpdateScheduleInput {
  name?: string;
  timezone?: string;
  isDefault?: boolean;
  slots?: ScheduleSlotInput[];
}

export class ScheduleService {
  async createSchedule(userId: string, data: CreateScheduleInput) {
    // Validate input
    const validation = createScheduleSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.message}`);
    }

    // Validate timezone
    const timezone = data.timezone || "UTC";
    if (!validateTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    // Validate slots if provided
    if (data.slots && data.slots.length > 0) {
      const slotsValidation = validateScheduleSlots(data.slots);
      if (!slotsValidation.valid) {
        throw new Error(
          `Slot validation failed: ${slotsValidation.errors.join(", ")}`
        );
      }
    }

    // If this is the first schedule or marked as default, make it default
    const existingSchedules = await prisma.schedule.count({
      where: { userId },
    });

    const isDefault = data.isDefault || existingSchedules === 0;

    // If this schedule is default, unset default on other schedules
    if (isDefault) {
      await prisma.schedule.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.schedule.create({
      data: {
        userId,
        name: data.name,
        timezone,
        isDefault,
        slots: {
          create: data.slots || [],
        },
      },
      include: {
        slots: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  }

  async getSchedulesByUserId(userId: string) {
    return prisma.schedule.findMany({
      where: { userId },
      include: {
        slots: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  async getScheduleById(scheduleId: string) {
    return prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        slots: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  }

  async updateSchedule(scheduleId: string, data: UpdateScheduleInput) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Validate timezone if provided
    if (data.timezone && !validateTimezone(data.timezone)) {
      throw new Error(`Invalid timezone: ${data.timezone}`);
    }

    // Validate slots if provided
    if (data.slots !== undefined) {
      if (data.slots.length === 0) {
        throw new Error("At least one time slot is required");
      }

      const slotsValidation = validateScheduleSlots(data.slots);
      if (!slotsValidation.valid) {
        throw new Error(
          `Slot validation failed: ${slotsValidation.errors.join(", ")}`
        );
      }
    }

    // If setting as default, unset default on other schedules
    if (data.isDefault) {
      await prisma.schedule.updateMany({
        where: { userId: schedule.userId, NOT: { id: scheduleId } },
        data: { isDefault: false },
      });
    }

    // If slots are provided, delete old ones and create new ones
    if (data.slots !== undefined) {
      await prisma.scheduleSlot.deleteMany({
        where: { scheduleId },
      });

      await prisma.scheduleSlot.createMany({
        data: data.slots.map((slot) => ({
          scheduleId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      });
    }

    return prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        name: data.name,
        timezone: data.timezone,
        isDefault: data.isDefault,
      },
      include: {
        slots: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  }

  async duplicateSchedule(scheduleId: string, newName: string) {
    const original = await this.getScheduleById(scheduleId);

    if (!original) {
      throw new Error("Schedule not found");
    }

    return prisma.schedule.create({
      data: {
        userId: original.userId,
        name: newName,
        timezone: original.timezone,
        isDefault: false, // Duplicated schedules are never default
        slots: {
          create: original.slots.map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      include: {
        slots: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  }

  async deleteSchedule(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Delete the schedule (slots will be cascade deleted)
    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    // If deleted schedule was default, make another one default
    if (schedule.isDefault) {
      const nextSchedule = await prisma.schedule.findFirst({
        where: { userId: schedule.userId },
        orderBy: { createdAt: "asc" },
      });

      if (nextSchedule) {
        await prisma.schedule.update({
          where: { id: nextSchedule.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefault(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Unset default on all other schedules
    await prisma.schedule.updateMany({
      where: { userId: schedule.userId },
      data: { isDefault: false },
    });

    // Set this one as default
    return prisma.schedule.update({
      where: { id: scheduleId },
      data: { isDefault: true },
      include: {
        slots: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  }
}

export const scheduleService = new ScheduleService();
