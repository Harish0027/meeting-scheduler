import { Request, Response } from "express";
import { bookingService } from "../services/bookingService";
import { createBookingSchema, cancelBookingSchema } from "../validators";
import { AppError, asyncHandler } from "../middlewares/errorHandler";
import { userService } from "../services/userService";
import { timeSlotService } from "../services/timeSlotService";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const validated = createBookingSchema.parse(req.body);
    const booking = await bookingService.createBooking(user.id, validated);

    res.status(201).json({
      success: true,
      data: booking,
    });
  }
);

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  res.json({
    success: true,
    data: booking,
  });
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getDefaultUser();
  const { status } = req.query as { status?: string };

  const bookings = await bookingService.getBookingsByUserId(user.id, status);

  res.json({
    success: true,
    data: bookings,
  });
});

export const getUpcomingBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getDefaultUser();
    const bookings = await bookingService.getUpcomingBookings(user.id);

    res.json({
      success: true,
      data: bookings,
    });
  }
);

export const getPastBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getDefaultUser();
    const bookings = await bookingService.getPastBookings(user.id);

    res.json({
      success: true,
      data: bookings,
    });
  }
);

export const cancelBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = cancelBookingSchema.parse({ bookingId: id });

    const booking = await bookingService.cancelBooking(validated.bookingId);

    res.json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  }
);

export const getAvailableTimeSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, eventTypeSlug } = req.params;
    const { date } = req.query as { date: string };

    if (!date) {
      throw new AppError("Date query parameter is required", 400);
    }

    const user = await userService.getUserByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const eventType = require("../services/eventTypeService").eventTypeService;
    const event = await eventType.getEventTypeBySlug(user.id, eventTypeSlug);

    if (!event) {
      throw new AppError("Event type not found", 404);
    }

    const slotDate = new Date(date);
    if (isNaN(slotDate.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    const slots = await timeSlotService.generateTimeSlots(
      user.id,
      event.id,
      slotDate
    );

    res.json({
      success: true,
      data: slots,
    });
  }
);
