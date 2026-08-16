import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

export const createProject = async(req , res) => {
    try {
        const { workspaceId } = req.params;
        const { title , description , status , startDate , dueDate , tags , members } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if(!workspace){
            return res.status(400).json({
                message: "Workspace not found",
            });
        }

        const isMember = workspace.members.some((member) => 
            member.user.toString() === req.user._id.toString()
        );

        if(!isMember){
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }

        const tagArray = tags ? tags.split(",") : [];

        const newProject = await Project.create({
            title,
            description,
            status,
            startDate,
            dueDate,
            tags: tagArray,
            workspace: workspaceId,
            members,
            createdBy: req.user._id,
        });

        workspace.projects.push(newProject._id);
        await workspace.save();

        return res.status(201).json(newProject);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getProjectDetails = async(req , res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if(!project){
            return res.status(404).json({
                message: "Project not found",
            });
        }
        
        const isMember = project.members.some(
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if(!isMember){
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        return res.status(200).json(project);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getProjectTasks = async(req , res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate("members.user");

        if(!project){
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if(!isMember){
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const tasks = await Task.find({
            project: projectId,
            isArchived: false,
        })
            .populate("assignees" , "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({
            project,
            tasks,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ GET ARCHIVED PROJECTS ============
export const getArchivedProjects = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                message: "workspaceId is required",
            });
        }

        // پیدا کردن پروژه‌های بایگانی شده در workspace
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