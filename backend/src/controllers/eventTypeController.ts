import { Request, Response } from "express";
import { eventTypeService } from "../services/eventTypeService";
import { createEventTypeSchema, updateEventTypeSchema } from "../validators";
import { AppError, asyncHandler } from "../middlewares/errorHandler";
import { userService } from "../services/userService";

export const createEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getDefaultUser();
    const validated = createEventTypeSchema.parse(req.body);

    const eventType = await eventTypeService.createEventType(
      user.id,
      validated
    );

    res.status(201).json({
      success: true,
      data: eventType,
    });
  }
);

export const getEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const eventType = await eventTypeService.getEventTypeById(id);

    if (!eventType) {
      throw new AppError("Event type not found", 404);
    }

    res.json({
      success: true,
      data: eventType,
    });
  }
);

export const getEventTypeBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, slug } = req.params;
    const user = await userService.getUserByUsername(username);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const eventType = await eventTypeService.getEventTypeBySlug(user.id, slug);

    if (!eventType) {
      throw new AppError("Event type not found", 404);
    }

    res.json({
      success: true,
      data: eventType,
    });
  }
);

export const getEventTypes = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getDefaultUser();
    const eventTypes = await eventTypeService.getEventTypesByUserId(user.id);

    res.json({
      success: true,
      data: eventTypes,
    });
  }
);

export const updateEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateEventTypeSchema.parse(req.body);

    const eventType = await eventTypeService.updateEventType(id, validated);

    res.json({
      success: true,
      data: eventType,
    });
  }
);

export const deleteEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await eventTypeService.deleteEventType(id);

    res.json({
      success: true,
      message: "Event type deleted successfully",
    });
  }
);
