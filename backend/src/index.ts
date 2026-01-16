import { createApp } from "./app";
import { prisma, disconnectDb } from "./db/prisma";
import { userService } from "./services/userService";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    await prisma.$connect();
    console.log("✓ Database connected");

    // Ensure default admin user exists
    await userService.getDefaultUser();
    console.log("✓ Default admin user initialized");

    // Create and start Express app
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      await disconnectDb();
      process.exit(0);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    await disconnectDb();
    process.exit(1);
  }
}

startServer();
