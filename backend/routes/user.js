import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
} from "../controllers/user.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put(
  "/profile",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string(),
      profilePicture: z.string().optional(),
    }),
  }),
  updateUserProfile
);

router.get(
  "/settings",
  authenticateUser,
  getUserSettings
);

router.put(
  "/settings",
  authenticateUser,
  validateRequest({
    body: z.object({
      notifications: z.object({
        taskAssignments: z.boolean(),
        taskUpdates: z.boolean(),
        projectUpdates: z.boolean(),
        workspaceInvites: z.boolean(),
        emailNotifications: z.boolean(),
      }).optional(),
      appearance: z.object({
        theme: z.enum(["light", "dark", "system"]),
        compactView: z.boolean(),
      }).optional(),
    }),
  }),
  updateUserSettings
);


router.put(
  "/change-password",
  authenticateUser,
  validateRequest({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  changePassword
);

export default router;