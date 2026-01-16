import { Router } from "express";
import {
  setAvailability,
  getAvailability,
  deleteAvailability,
} from "../controllers/availabilityController";

const router = Router();

router.post("/", setAvailability);
router.get("/", getAvailability);
router.delete("/:dayOfWeek", deleteAvailability);

export default router;
