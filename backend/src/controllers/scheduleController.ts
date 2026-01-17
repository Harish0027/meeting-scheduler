import { Request, Response } from "express";
import { scheduleService } from "../services/scheduleService";
import { asyncHandler, AppError } from "../middlewares/errorHandler";
import { userService } from "../services/userService";

export const getSchedules = asyncHandler(
  async (req: Request, res: Response) => {
    const userIdParam =
      (req.query.userId as string) || (req.headers["x-user-id"] as string);
    let user;
    if (userIdParam) {
      user = await userService.getUserById(userIdParam);
      if (!user) {
        throw new AppError("User not found", 404);
      }
    } else {
      user = await userService.getDefaultUser();
    }
    const schedules = await scheduleService.getSchedulesByUserId(user.id);

    res.json({
      success: true,
      data: schedules,
    });
  }
);

export const getScheduleById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const schedule = await scheduleService.getScheduleById(id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        error: { message: "Schedule not found" },
      });
      return;
    }

    res.json({
      success: true,
      data: schedule,
    });
  }
);

export const createSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const userIdParam =
      (req.query.userId as string) || (req.headers["x-user-id"] as string);
    let user;
    if (userIdParam) {
      user = await userService.getUserById(userIdParam);
      if (!user) {
        throw new AppError("User not found", 404);
      }
    } else {
      user = await userService.getDefaultUser();
    }
    const { name, timezone, isDefault, slots } = req.body;

    const schedule = await scheduleService.createSchedule(user.id, {
      name,
      timezone,
      isDefault,
      slots,
    });

    res.status(201).json({
      success: true,
      data: schedule,
    });
  }
);

export const updateSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, timezone, isDefault, slots } = req.body;

    const schedule = await scheduleService.updateSchedule(id, {
      name,
      timezone,
      isDefault,
      slots,
    });

    res.json({
      success: true,
      data: schedule,
    });
  }
);

export const duplicateSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        error: { message: "Name is required" },
      });
      return;
    }

    const schedule = await scheduleService.duplicateSchedule(id, name.trim());

    res.status(201).json({
      success: true,
      data: schedule,
    });
  }
);

export const deleteSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await scheduleService.deleteSchedule(id);

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  }
);

export const setDefaultSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const schedule = await scheduleService.setDefault(id);

    res.json({
      success: true,
      data: schedule,
    });
  }
);
