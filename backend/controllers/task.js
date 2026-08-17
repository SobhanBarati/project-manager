// backend/controllers/task.js

import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import { createNotification } from "../libs/notification.js";

// ============ CREATE TASK ============
const createTask = async(req , res) => {
    try {
        const { projectId } = req.params;
        const { title , description , status , priority , dueDate , assignees } = req.body;

        console.log(req.body);

        const project = await Project.findById(projectId);

        if(!project){
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(project.workspace);

        if(!workspace){
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if(!isMember) {
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }

        const newTask = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            assignees,
            project: projectId,
            createdBy: req.user._id,
        });

        project.tasks.push(newTask._id);
        await project.save();

        // ======================================================
        // ✅ CREATE NOTIFICATIONS FOR ASSIGNEES
        // ======================================================
        if (assignees && assignees.length > 0) {
            for (const assigneeId of assignees) {
                if (assigneeId.toString() !== req.user._id.toString()) {
                    await createNotification({
                        userId: assigneeId,
                        title: "New task assigned to you",
                        message: `${req.user.name} assigned you to "${title}"`,
                        type: "task",
                        link: `/workspaces/${workspace._id}/projects/${projectId}/tasks/${newTask._id}`,
                        metadata: {
                            taskId: newTask._id,
                            projectId: projectId,
                            workspaceId: workspace._id,
                            assignedBy: req.user.name,
                            assignedById: req.user._id,
                        },
                    });
                    console.log(`📨 Notification sent to ${assigneeId}`);
                }
            }
        }

        res.status(201).json(newTask);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ GET TASK BY ID ============
const getTaskById = async(req , res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId)
            .populate("assignees", "name profilePicture")
            .populate("watchers", "name profilePicture");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project).populate(
          "members.user",
          "name profilePicture"
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(project.workspace);

        res.status(200).json({ 
            task, 
            project,
            workspace,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ UPDATE TASK TITLE ============
const updateTaskTitle = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;
        
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );
      
        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
      
        const oldTitle = task.title;
      
        task.title = title;
        await task.save();
      
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
          description: `updated task title from ${oldTitle} to ${title}`,
        });
      
        res.status(200).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }   
};

// ============ UPDATE TASK DESCRIPTION ============
const updateTaskDescription = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { description } = req.body;
        
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );
      
        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
      
        const oldDescription = 
            task.description?.substring(0 , 50) +
            (task.description?.length > 50 ? "..." : "");

        const newDescription = 
            description?.substring(0 , 50) + (description?.length > 50 ? "..." : "");
      
        task.description = description;
        await task.save();
      
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
          description: `updated task description from ${oldDescription} to ${newDescription}`,
        });
      
        res.status(200).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }   
};

// ============ UPDATE TASK STATUS ============
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );
      
        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
      
        const oldStatus = task.status;
      
        task.status = status;
        await task.save();
      
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
          description: `updated task status from ${oldStatus} to ${status}`,
        });
      
        res.status(200).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }   
};

// ============ UPDATE TASK ASSIGNEES ============
const updateTaskAssignees = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignees } = req.body;
        
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

        const workspace = await Workspace.findById(project.workspace);
      
        const isMember = project.members.some(
            (member) => member.user._id.toString() === req.user._id.toString()
        );
      
        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
      
        const oldAssignees = task.assignees.map(id => id.toString());
        const newAssignees = assignees || [];

        const addedAssignees = newAssignees.filter(
            (id) => !oldAssignees.includes(id.toString())
        );

        const removedAssignees = oldAssignees.filter(
            (id) => !newAssignees.map(a => a.toString()).includes(id)
        );

        // ======================================================
        // ✅ ارسال نوتیفیکیشن برای کاربران جدید
        // ======================================================
        if (addedAssignees.length > 0) {
            for (const assigneeId of addedAssignees) {
                if (assigneeId.toString() !== req.user._id.toString()) {
                    await createNotification({
                        userId: assigneeId,
                        title: "You were assigned to a task",
                        message: `${req.user.name} assigned you to "${task.title}"`,
                        type: "task",
                        link: `/workspaces/${workspace._id}/projects/${project._id}/tasks/${task._id}`,
                        metadata: {
                            taskId: task._id,
                            projectId: project._id,
                            workspaceId: workspace._id,
                            assignedBy: req.user.name,
                            assignedById: req.user._id,
                        },
                    });
                    console.log(`📨 Notification sent to ${assigneeId}`);
                }
            }
        }

        // ======================================================
        // ✅ ارسال نوتیفیکیشن برای کاربرانی که حذف شدن
        // ======================================================
        if (removedAssignees.length > 0) {
            for (const assigneeId of removedAssignees) {
                if (assigneeId.toString() !== req.user._id.toString()) {
                    await createNotification({
                        userId: assigneeId,
                        title: "You were removed from a task",
                        message: `${req.user.name} removed you from "${task.title}"`,
                        type: "task",
                        link: `/workspaces/${workspace._id}/projects/${project._id}/tasks/${task._id}`,
                        metadata: {
                            taskId: task._id,
                            projectId: project._id,
                            workspaceId: workspace._id,
                            removedBy: req.user.name,
                            removedById: req.user._id,
                        },
                    });
                    console.log(`📨 Removed notification sent to ${assigneeId}`);
                }
            }
        }
      
        task.assignees = assignees;
        await task.save();
      
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
          description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
        });
      
        res.status(200).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }   
};

// ============ UPDATE TASK PRIORITY ============
const updateTaskPriority = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { priority } = req.body;
        
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );
      
        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
      
        const oldPriority = task.priority;
      
        task.priority = priority;
        await task.save();
      
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
          description: `updated task priority from ${oldPriority} to ${priority}`,
        });
      
        res.status(200).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }   
};

// ============ ADD SUBTASK ============
const addSubTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;
        
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );
      
        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
      
        const newSubTask = {
            title,
            completed: false,
        };
      
        task.subtasks.push(newSubTask);
        await task.save();
      
        await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
            description: `created subtask ${title}`,
        });
      
        res.status(201).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ UPDATE SUBTASK ============
const updateSubTask = async (req, res) => {
    try {
        const { taskId, subTaskId } = req.params;
        const { completed } = req.body;
        
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
      
        const subTask = task.subtasks.find(
            (subTask) => subTask._id.toString() === subTaskId
        );
      
        if (!subTask) {
            return res.status(404).json({
                message: "Subtask not found",
            });
        }
      
        subTask.completed = completed;
        await task.save();
      
        await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
            description: `updated subtask ${subTask.title}`,
        });
      
        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ GET ACTIVITY ============
const getActivityByResourceId = async (req, res) => {
    try {
        const { resourceId } = req.params;
        
        const activity = await ActivityLog.find({ resourceId })
            .populate("user", "name profilePicture")
            .sort({ createdAt: -1 });
        
        res.status(200).json(activity);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ GET COMMENTS ============
const getCommentsByTaskId = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate("author", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ ADD COMMENT ============
const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;

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
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const newComment = await Comment.create({
          text,
          task: taskId,
          author: req.user._id,
        });

        task.comments.push(newComment._id);
        await task.save();

        await recordActivity(req.user._id, "added_comment", "Task", taskId, {
            description: `added comment ${
                text.substring(0, 50) + (text.length > 50 ? "..." : "")
            }`,
        });

        res.status(201).json(newComment);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ WATCH TASK ============
const watchTask = async (req, res) => {
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const isWatching = task.watchers.includes(req.user._id);

        if (!isWatching) {
            task.watchers.push(req.user._id);
        } else {
            task.watchers = task.watchers.filter(
                (watcher) => watcher.toString() !== req.user._id.toString()
            );
        }

        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${
                isWatching ? "stopped watching" : "started watching"
            } task ${task.title}`,
        });

        res.status(200).json(task);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ ARCHIVE/UNARCHIVE TASK ============
const achievedTask = async (req, res) => {
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
            (member) => member.user._id.toString() === req.user._id.toString()
        );  

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
        const isAchieved = task.isArchived;

        task.isArchived = !isAchieved;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isAchieved ? "unarchived" : "archived"} task ${
                task.title
            }`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ GET MY TASKS ============
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
            .populate("project", "title workspace")
            .sort({ createdAt: -1 });

      res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// ============ GET ARCHIVED TASKS ============
const getArchivedTasks = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                message: "workspaceId is required",
            });
        }

        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false,
        });

        const projectIds = projects.map((project) => project._id);

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

// ============ UNARCHIVE TASK ============
const unarchiveTask = async (req, res) => {
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

// ============ EXPORT ============
export { 
    createTask, 
    getTaskById, 
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    updateTaskAssignees,
    updateTaskPriority,
    addSubTask,
    updateSubTask,
    getActivityByResourceId,
    getCommentsByTaskId,
    addComment,
    watchTask,
    achievedTask,
    getMyTasks,
    getArchivedTasks,
    unarchiveTask,
};