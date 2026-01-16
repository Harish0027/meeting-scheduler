import { z } from "zod";

// User validation
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  timezone: z.string().default("UTC"),
});

export const updateUserSchema = z.object({
  timezone: z.string().optional(),
});

// Event Type validation
export const createEventTypeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  duration: z.number().int().min(15).max(480), // 15 min to 8 hours
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

export const updateEventTypeSchema = createEventTypeSchema.partial();

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
  eventTypeSlug: z.string(),
  bookerName: z.string().min(1).max(255),
  bookerEmail: z.string().email(),
  bookerPhone: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string(),
});

// Type exports for use in controllers
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>;
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
