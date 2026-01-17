import { Request, Response } from "express";
import { bookingService } from "../services/bookingService";
import {
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  updateBookingLocationSchema,
  addBookingGuestsSchema,
} from "../validators";
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
  // Get userId from query param or x-user-id header; fall back to default user for backwards compat
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
  const {
    status,
    attendeeName,
    attendeeEmail,
    eventTypeId,
    dateFrom,
    dateTo,
    bookingUid,
  } = req.query as {
    status?: string;
    attendeeName?: string;
    attendeeEmail?: string;
    eventTypeId?: string;
    dateFrom?: string;
    dateTo?: string;
    bookingUid?: string;
  };

  const bookings = await bookingService.getBookingsByUserId(user.id, {
    status,
    attendeeName,
    attendeeEmail,
    eventTypeId,
    dateFrom,
    dateTo,
    bookingUid,
  });

  res.json({
    success: true,
    data: bookings,
  });
});

export const getUpcomingBookings = asyncHandler(
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
    const bookings = await bookingService.getUpcomingBookings(user.id);

    res.json({
      success: true,
      data: bookings,
    });
  }
);

export const getPastBookings = asyncHandler(
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
    const { bookerEmail } = req.body; // Get bookerEmail for ownership validation

    console.log("Cancel booking request:", { id, body: req.body, bookerEmail });

    const validated = cancelBookingSchema.parse({ bookingId: id });

    if (!bookerEmail) {
      res.status(400).json({
        success: false,
        error: { message: "bookerEmail is required" },
      });
      return;
    }

    const booking = await bookingService.cancelBooking(
      validated.bookingId,
      bookerEmail
    );

    res.json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  }
);

export const rescheduleBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { bookerEmail, ...rescheduleData } = req.body; // Extract bookerEmail
    const validated = rescheduleBookingSchema.parse(rescheduleData);

    if (!bookerEmail) {
      res.status(400).json({
        success: false,
        error: { message: "bookerEmail is required" },
      });
      return;
    }

    const booking = await bookingService.rescheduleBooking(
      id,
      bookerEmail,
      validated
    );

    res.json({
      success: true,
      data: booking,
      message: "Booking rescheduled successfully",
    });
  }
);

export const updateBookingLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = updateBookingLocationSchema.parse(req.body);

    const booking = await bookingService.updateBookingLocation(id, validated);

    res.json({
      success: true,
      data: booking,
      message: "Booking location updated successfully",
    });
  }
);

export const addBookingGuests = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verify user is the host (admin)
    const user = await userService.getDefaultUser();
    const existingBooking = await bookingService.getBookingById(id);

    if (!existingBooking) {
      throw new AppError("Booking not found", 404);
    }

    if (existingBooking.userId !== user.id) {
      throw new AppError("Only the host can add guests to this booking", 403);
    }

    const validated = addBookingGuestsSchema.parse(req.body);
    const booking = await bookingService.addBookingGuests(id, validated);

    res.json({
      success: true,
      data: booking,
      message: "Guests added successfully",
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
      event.id,
      slotDate,
      user.timezone || "UTC"
    );

    res.json({
      success: true,
      data: slots,
    });
  }
);
