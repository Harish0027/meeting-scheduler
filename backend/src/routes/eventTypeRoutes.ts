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
router.get("/all", getEventTypes);
router.get("/:id", getEventType);
router.put("/:id", updateEventType);
router.delete("/:id", deleteEventType);

// Public routes
router.get("/:username/:slug", getEventTypeBySlug);

export default router;
