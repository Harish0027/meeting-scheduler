import { Router } from "express";
import {
  createUser,
  getUser,
  getUserByUsername,
  updateUser,
} from "../controllers/userController";

const router = Router();

router.post("/", createUser);
router.get("/profile", getUser);
router.get("/:username", getUserByUsername);
router.put("/:id", updateUser);

export default router;
