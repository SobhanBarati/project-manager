import mongoose , { Schema } from "mongoose";

const userSchema = new Schema({
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        profilePicture: {
            type: String,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        lastLogin: {
            type: Date,
        },

        is2FAEnabled: {
            type: Boolean,
            default: false,
        },

        twoFAOtp: {
            type: String,
            select: false,
        },

        twoFAOtpExpires: {
            type: Date,
            select: false,
        },

        settings: {
            notifications: {
              taskAssignments: { type: Boolean, default: true },
              taskUpdates: { type: Boolean, default: true },
              projectUpdates: { type: Boolean, default: true },
              workspaceInvites: { type: Boolean, default: true },
              emailNotifications: { type: Boolean, default: true },
            },
            appearance: {
              theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
              compactView: { type: Boolean, default: false },
            },
        }, 

        workspace: {
            defaultWorkspace: { 
              type: Schema.Types.ObjectId, 
              ref: "Workspace",
              default: null 
            },
            notifications: {
              enabled: { type: Boolean, default: true },
              taskUpdates: { type: Boolean, default: true },
              projectUpdates: { type: Boolean, default: true },
              memberUpdates: { type: Boolean, default: true },
            },
        },
    }, 
    { timestamps : true }
);

const User = mongoose.model("User", userSchema);

export default User;