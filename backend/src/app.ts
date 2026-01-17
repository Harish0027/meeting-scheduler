import express, { Express } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import eventTypeRoutes from "./routes/eventTypeRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/event-types", eventTypeRoutes);
  app.use("/api/availability", availabilityRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/schedules", scheduleRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
