import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(3, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be 8 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password must be 8 characters"),
});

const verifyEmailSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["owner" , "contributor" , "viewer"]),
});

const tokenSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

const resetPasswordRequestSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// ✅ اسکیمای درست برای reset-password
const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


const workspaceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    color: z.string().min(1 , "Color is required"),
});


const projectSchema = z.object({
    title: z.string().min(3,"Title is required"),
    description: z.string().optional(),
    status: z.enum([
        "Planning",
        "In Progress",
        "On Hold",
        "Completed",
        "Cancelled",
    ]),
    startDate: z.string(),
    dueDate: z.string().optional(),
    tags: z.string().optional(),
    members: z
        .array(
            z.object({
                user: z.string(),
                role: z.enum(["manager" , "contributor" , "viewer"]),
            })
        )
});

const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    status: z.enum(["To Do", "In Progress", "Done"]),
    priority: z.enum(["Low", "Medium", "High"]),
    dueDate: z.string().min(1, "Due date is required"),
    assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});


export {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resetPasswordRequestSchema,
    resetPasswordSchema,
    workspaceSchema,
    projectSchema,
    taskSchema,
    inviteMemberSchema,
    tokenSchema,
};