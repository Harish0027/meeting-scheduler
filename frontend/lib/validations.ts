import { z } from "zod";

export const bookingFormSchema = z.object({
  bookerName: z.string().min(1, "Name is required").max(255),
  bookerEmail: z.string().email("Invalid email address"),
  bookerPhone: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

export const eventTypeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
  duration: z.coerce.number().int().min(15).max(480),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

export type EventTypeFormInput = z.infer<typeof eventTypeFormSchema>;

export const availabilityFormSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export type AvailabilityFormInput = z.infer<typeof availabilityFormSchema>;
