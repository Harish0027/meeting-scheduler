import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateAdminEmail() {
  try {
    const admin = await prisma.user.findFirst({
      where: { username: "admin" },
    });

    if (admin) {
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          email: "admin@example.com",
          timezone: "Asia/Calcutta",
        },
      });
      console.log("✓ Admin email updated to admin@example.com");
      console.log("✓ Timezone set to Asia/Calcutta");
    } else {
      console.log("No admin user found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmail();
