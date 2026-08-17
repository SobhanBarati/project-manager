// backend/routes/notification.js

import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../controllers/notification.js";

const router = express.Router();

// دریافت همه نوتیفیکیشن‌های کاربر
router.get("/", authMiddleware, getNotifications);

// علامت زدن یک نوتیفیکیشن به عنوان خوانده شده
router.put("/:notificationId/read", authMiddleware, markAsRead);

// علامت زدن همه نوتیفیکیشن‌ها به عنوان خوانده شده
router.put("/read-all", authMiddleware, markAllAsRead);

export default router;