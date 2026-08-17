// backend/libs/notification.js

import Notification from "../models/notification.js";

export const createNotification = async ({
    userId,
    title,
    message,
    type,
    link,
    metadata,
}) => {
    try {
        if (!userId) {
            console.log("❌ No userId provided for notification");
            return;
        }

        const notification = await Notification.create({
            userId,
            title,
            message,
            type: type || "task",
            link: link || "",
            metadata: metadata || {},
        });

        console.log(`✅ Notification created for user ${userId}: ${title}`);
        return notification;
    } catch (error) {
        console.error("❌ Failed to create notification:", error);
    }
};