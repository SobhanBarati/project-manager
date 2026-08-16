import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import authMiddleware from "../middleware/auth-middleware.js";
import {
    getArchivedTasks,
    getArchivedProjects,
    unarchiveTask,
    unarchiveProject,
    getAllArchivedItems,
} from "../controllers/archived.js";

const router = express.Router();

// ============ GET ROUTES ============

// دریافت تمام آیتم‌های بایگانی شده (تسک‌ها و پروژه‌ها)
router.get(
    "/all",
    authMiddleware,
    validateRequest({
        query: z.object({
            workspaceId: z.string(),
        }),
    }),
    getAllArchivedItems
);

// دریافت تسک‌های بایگانی شده
router.get(
    "/tasks",
    authMiddleware,
    validateRequest({
        query: z.object({
            workspaceId: z.string(),
        }),
    }),
    getArchivedTasks
);

// دریافت پروژه‌های بایگانی شده
router.get(
    "/projects",
    authMiddleware,
    validateRequest({
        query: z.object({
            workspaceId: z.string(),
        }),
    }),
    getArchivedProjects
);

// ============ PUT ROUTES ============

// خارج کردن تسک از حالت بایگانی
router.put(
    "/tasks/:taskId/unarchive",
    authMiddleware,
    validateRequest({
        params: z.object({
            taskId: z.string(),
        }),
    }),
    unarchiveTask
);

// خارج کردن پروژه از حالت بایگانی
router.put(
    "/projects/:projectId/unarchive",
    authMiddleware,
    validateRequest({
        params: z.object({
            projectId: z.string(),
        }),
    }),
    unarchiveProject
);

export default router;