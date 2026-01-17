import { prisma } from "../db/prisma";
import { CreateUserInput, UpdateUserInput } from "../validators";

export class UserService {
  async createOrGetUser(data: CreateUserInput) {
    return prisma.user.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
  }

  async getUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async getDefaultUser() {
    // For the admin user (assuming one default user)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: "admin",
          email: "admin@example.com",
          timezone: "Asia/Calcutta",
        },
      });
    }
    return user;
  }
}

export const userService = new UserService();
