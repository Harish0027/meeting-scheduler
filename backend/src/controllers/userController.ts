import { Request, Response } from "express";
import { userService } from "../services/userService";
import { createUserSchema, updateUserSchema } from "../validators";
import { AppError, asyncHandler } from "../middlewares/errorHandler";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const validated = createUserSchema.parse(req.body);
  const user = await userService.createOrGetUser(validated);

  res.status(201).json({
    success: true,
    data: user,
  });
});

export const getUserByUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: user,
    });
  }
);

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getDefaultUser();

  res.json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  let { id } = req.params;

  // If route is /me, get the default user
  if (id === "me" || !id) {
    const defaultUser = await userService.getDefaultUser();
    id = defaultUser.id;
  }

  const validated = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(id, validated);

  res.json({
    success: true,
    data: user,
  });
});
