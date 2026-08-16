import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import { recordActivity } from "../libs/index.js";

// ============ GET ARCHIVED TASKS ============
export const getArchivedTasks = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        console.log("📥 getArchivedTasks - workspaceId:", workspaceId);

        if (!workspaceId) {
            return res.status(400).json({
                message: "workspaceId is required",
            });
        }

        // پیدا کردن تمام پروژه‌های workspace (غیر بایگانی)
        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false,
        });

        const projectIds = projects.map((project) => project._id);

        // پیدا کردن تسک‌های بایگانی شده
        const archivedTasks = await Task.find({
            project: { $in: projectIds },
            isArchived: true,
        })
            .populate("assignees", "name profilePicture email")
            .populate("project", "title workspace")
            .sort({ updatedAt: -1 });

        res.status(200).json(archivedTasks);
    } catch (error) {
        console.error("❌ Get archived tasks error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


// ============ GET ARCHIVED PROJECTS ============
export const getArchivedProjects = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        console.log("📥 getArchivedProjects - workspaceId:", workspaceId);

        if (!workspaceId) {
            return res.status(400).json({
                message: "workspaceId is required",
            });
        }

        // پیدا کردن پروژه‌های بایگانی شده
        const archivedProjects = await Project.find({
            workspace: workspaceId,
            isArchived: true,
        })
            .populate("members.user", "name profilePicture email")
            .populate("createdBy", "name profilePicture")
            .sort({ updatedAt: -1 });

        res.status(200).json(archivedProjects);
    } catch (error) {
        console.error("❌ Get archived projects error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ============ UNARCHIVE TASK ============
export const unarchiveTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        if (!task.isArchived) {
            return res.status(400).json({
                message: "Task is not archived",
            });
        }

        task.isArchived = false;
        await task.save();

        await recordActivity(
            req.user._id,
            "updated_task",
            "Task",
            taskId,
            {
                description: `unarchived task ${task.title}`,
            }
        );

        res.status(200).json({
            message: "Task unarchived successfully",
            task,
        });
    } catch (error) {
        console.error("❌ Unarchive task error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ============ UNARCHIVE PROJECT ============
export const unarchiveProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(project.workspace);
        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }

        if (!project.isArchived) {
            return res.status(400).json({
                message: "Project is not archived",
            });
        }

        project.isArchived = false;
        await project.save();

        await recordActivity(
            req.user._id,
            "updated_project",
            "Project",
            projectId,
            {
                description: `unarchived project ${project.title}`,
            }
        );

        res.status(200).json({
            message: "Project unarchived successfully",
            project,
        });
    } catch (error) {
        console.error("❌ Unarchive project error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ============ GET ALL ARCHIVED ITEMS (تسک‌ها و پروژه‌ها با هم) ============
export const getAllArchivedItems = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                message: "workspaceId is required",
            });
        }

        // پیدا کردن تمام پروژه‌های workspace (غیر بایگانی)
        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false,
        });

        const projectIds = projects.map((project) => project._id);

        // دریافت تسک‌های بایگانی شده
        const archivedTasks = await Task.find({
            project: { $in: projectIds },
            isArchived: true,
        })
            .populate("assignees", "name profilePicture")
            .populate("project", "title")
            .sort({ updatedAt: -1 });

        // دریافت پروژه‌های بایگانی شده
        const archivedProjects = await Project.find({
            workspace: workspaceId,
            isArchived: true,
        })
            .populate("members.user", "name profilePicture")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            tasks: archivedTasks,
            projects: archivedProjects,
            total: archivedTasks.length + archivedProjects.length,
        });
    } catch (error) {
        console.error("❌ Get all archived items error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};