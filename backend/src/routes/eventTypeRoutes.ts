import { Router } from "express";
import {
  createEventType,
  getEventType,
  getEventTypeBySlug,
  getEventTypes,
  updateEventType,
  deleteEventType,
} from "../controllers/eventTypeController";

const router = Router();

// Admin routes
router.post("/", createEventType);
router.get("/", getEventTypes);
router.get("/all", getEventTypes);

// Public routes (must be before /:id to avoid conflicts)
router.get("/:username/:slug", getEventTypeBySlug);

// Single event type by ID
router.get("/id/:id", getEventType);
router.put("/:id", updateEventType);
router.delete("/:id", deleteEventType);

// Public routes
router.get("/:username/:slug", getEventTypeBySlug);

export default router;
