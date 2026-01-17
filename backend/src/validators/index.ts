import { z } from "zod";

// User validation
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  timezone: z.string().default("UTC"),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
});

// Event Type validation
export const createEventTypeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  duration: z.number().int().min(5).max(480), // 5 min to 8 hours
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  scheduleId: z.string().optional(), // References Schedule (availability)
  location: z.enum(["meet", "in-person", "phone"]).default("meet"),
  locationValue: z.string().optional(), // Address or phone number
  bufferTime: z.number().int().min(0).max(120).optional().default(0),
  maxBookingsPerDay: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateEventTypeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  duration: z.number().int().min(5).max(480).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  scheduleId: z.string().optional(),
  location: z.enum(["meet", "in-person", "phone"]).optional(),
  locationValue: z.string().optional(),
  bufferTime: z.number().int().min(0).max(120).optional(),
  maxBookingsPerDay: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

// Availability validation
export const setAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM"),
});

// Booking validation
export const createBookingSchema = z.object({
  eventTypeId: z.string(),
  bookerName: z.string().min(1).max(255),
  bookerEmail: z.string().email(),
  bookerPhone: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timeZone: z.string().optional(),
  location: z.enum(["meet", "in-person", "phone"]).default("meet"),
  locationValue: z.string().optional(),
  guests: z.array(z.string().email()).optional(),
  notes: z.string().max(1000).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string(),
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  rescheduleReason: z.string().max(1000).optional(),
});

export const updateBookingLocationSchema = z.object({
  location: z.enum(["meet", "in-person", "phone"]),
  locationValue: z.string().optional(),
});

export const addBookingGuestsSchema = z.object({
  guests: z.array(z.string().email()).min(1).max(10),
});

// Type exports for use in controllers
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>;
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type UpdateBookingLocationInput = z.infer<
  typeof updateBookingLocationSchema
>;
export type AddBookingGuestsInput = z.infer<typeof addBookingGuestsSchema>;
