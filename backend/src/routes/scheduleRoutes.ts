import { Router } from "express";
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  duplicateSchedule,
  deleteSchedule,
  setDefaultSchedule,
} from "../controllers/scheduleController";

const router = Router();

router.get("/", getSchedules);
router.get("/:id", getScheduleById);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.post("/:id/duplicate", duplicateSchedule);
router.delete("/:id", deleteSchedule);
router.put("/:id/default", setDefaultSchedule);

export default router;
