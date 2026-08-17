// backend/controllers/notification.js

import Notification from "../models/notification.js";

// ============ GET ALL NOTIFICATIONS ============
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(notifications);
    } catch (error) {
        console.error("❌ Get notifications error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ============ MARK AS READ ============
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOne({
            _id: notificationId,
            userId: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error("❌ Mark as read error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ============ MARK ALL AS READ ============
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.user._id,
                read: false,
            },
            {
                read: true,
            }
        );

        res.status(200).json({
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("❌ Mark all as read error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};