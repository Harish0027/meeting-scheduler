import { Router } from "express";
import {
  createBooking,
  getBooking,
  getBookings,
  getUpcomingBookings,
  getPastBookings,
  cancelBooking,
  rescheduleBooking,
  updateBookingLocation,
  addBookingGuests,
  getAvailableTimeSlots,
} from "../controllers/bookingController";

const router = Router();

// Admin routes
router.get("/", getBookings);
router.get("/upcoming", getUpcomingBookings);
router.get("/past", getPastBookings);
router.get("/:id", getBooking);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/reschedule", rescheduleBooking);
router.put("/:id/location", updateBookingLocation);
router.put("/:id/guests", addBookingGuests);

// Public routes
router.post("/:username/:eventTypeSlug", createBooking);
router.get("/:username/:eventTypeSlug/slots", getAvailableTimeSlots);

export default router;
