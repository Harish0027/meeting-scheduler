import { Request, Response } from "express";
import { availabilityService } from "../services/availabilityService";
import { setAvailabilitySchema } from "../validators";
import { AppError, asyncHandler } from "../middlewares/errorHandler";
import { userService } from "../services/userService";

export const setAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getDefaultUser();
    const validated = setAvailabilitySchema.parse(req.body);

    const availability = await availabilityService.setAvailability(
      user.id,
      validated
    );

    res.status(201).json({
      success: true,
      data: availability,
    });
  }
);

export const getAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getDefaultUser();
    const availabilities = await availabilityService.getAvailabilityByUserId(
      user.id
    );

    res.json({
      success: true,
      data: availabilities,
    });
  }
);

export const deleteAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const { dayOfWeek } = req.params;
    const user = await userService.getDefaultUser();

    await availabilityService.deleteAvailability(user.id, parseInt(dayOfWeek));

    res.json({
      success: true,
      message: "Availability deleted successfully",
    });
  }
);
