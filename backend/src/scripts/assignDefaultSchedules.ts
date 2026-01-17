import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignDefaultSchedules() {
  try {
    console.log("Checking for event types without schedules...");

    // Get the default user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found");
      return;
    }

    // Find or create a default schedule
    let defaultSchedule = await prisma.schedule.findFirst({
      where: { userId: user.id },
    });

    if (!defaultSchedule) {
      console.log("Creating default schedule...");
      defaultSchedule = await prisma.schedule.create({
        data: {
          userId: user.id,
          name: "Working Hours",
          timezone: user.timezone || "UTC",
          isDefault: true,
        },
      });

      // Add default schedule slots (Monday-Friday, 9 AM - 5 PM)
      const workDays = [1, 2, 3, 4, 5]; // Monday to Friday
      for (const day of workDays) {
        await prisma.scheduleSlot.create({
          data: {
            scheduleId: defaultSchedule.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
          },
        });
      }
      console.log(
        "✓ Created default schedule with working hours (Mon-Fri, 9 AM - 5 PM)"
      );
    }

    // Find event types without schedules
    const eventTypesWithoutSchedule = await prisma.eventType.findMany({
      where: {
        scheduleId: null,
      },
    });

    if (eventTypesWithoutSchedule.length === 0) {
      console.log("✓ All event types already have schedules assigned");
      return;
    }

    console.log(
      `Found ${eventTypesWithoutSchedule.length} event types without schedules`
    );

    // Assign default schedule to all event types without one
    for (const eventType of eventTypesWithoutSchedule) {
      await prisma.eventType.update({
        where: { id: eventType.id },
        data: { scheduleId: defaultSchedule.id },
      });
      console.log(`✓ Assigned schedule to event type: ${eventType.title}`);
    }

    console.log("\n✓ All event types now have schedules assigned!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

assignDefaultSchedules();
