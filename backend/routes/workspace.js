import express from "express";
import { validateRequest } from "zod-express-middleware";
import { 
    workspaceSchema,
    inviteMemberSchema,
    tokenSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { 
    createWorkspace, 
    getWorkspaces, 
    getWorkspaceDetails, 
    getWorkspaceProjects,
    getWorkspaceStats,
    acceptGenerateInvite,
    acceptInviteByToken,
    inviteUserToWorkspace,
    setDefaultWorkspace,        // ✅ اضافه کنید
    getDefaultWorkspace,        // ✅ اضافه کنید
    updateWorkspaceNotifications, // ✅ اضافه کنید
    exportWorkspaceData,        // ✅ اضافه کنید
} from "../controllers/workspace.js";

import { z } from "zod"; 

const router = express.Router();

router.post(
    "/",
    authMiddleware, 
    validateRequest({
        body: workspaceSchema
    }),
    createWorkspace
);

// دریافت ورک‌اسپیس پیش‌فرض
router.get(
    "/default",
    authMiddleware,
    getDefaultWorkspace
);

// به‌روزرسانی تنظیمات نوتیفیکیشن ورک‌اسپیس
router.put(
    "/notifications",
    authMiddleware,
    validateRequest({
        body: z.object({
            enabled: z.boolean().optional(),
            taskUpdates: z.boolean().optional(),
            projectUpdates: z.boolean().optional(),
            memberUpdates: z.boolean().optional(),
        }),
    }),
    updateWorkspaceNotifications
);

router.post(
    "/accept-invite-token",
    authMiddleware,
    validateRequest({ body: tokenSchema }),
    acceptInviteByToken
);

router.post("/:workspaceId/invite-member", 
    authMiddleware, 
    validateRequest({ 
        params: z.object({ workspaceId: z.string() }),
        body: inviteMemberSchema 
    }), 
    inviteUserToWorkspace
);

router.post("/:workspaceId/accept-generate-invite", 
    authMiddleware, 
    validateRequest({ 
        params: z.object({ workspaceId: z.string() }),
    }), 
    acceptGenerateInvite
);

router.get("/" , authMiddleware , getWorkspaces);

router.get("/:workspaceId" , authMiddleware , getWorkspaceDetails);
router.get("/:workspaceId/projects" , authMiddleware , getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware , getWorkspaceStats);

// تنظیم ورک‌اسپیس پیش‌فرض
router.put(
    "/:workspaceId/set-default",
    authMiddleware,
    validateRequest({
        params: z.object({
            workspaceId: z.string(),
        }),
    }),
    setDefaultWorkspace
);

// خروجی گرفتن از داده‌های ورک‌اسپیس
router.get(
    "/:workspaceId/export",
    authMiddleware,
    validateRequest({
        params: z.object({
            workspaceId: z.string(),
        }),
    }),
    exportWorkspaceData
);

export default router;