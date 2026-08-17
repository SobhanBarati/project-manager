// backend/models/notification.js

import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["task", "project", "workspace", "mention"],
            default: "task",
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        link: {
            type: String,
            default: "",
        },
        metadata: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

// ایندکس برای جستجوی بهتر
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;