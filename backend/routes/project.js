import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validate-schema.js";
import { z } from "zod";
import { createProject , getProjectDetails , getProjectTasks , getArchivedProjects , unarchiveProject } from "../controllers/project.js";

const router = express.Router();

router.get("/archived",
    authMiddleware,
    validateRequest({
        query: z.object({
            workspaceId: z.string(),
        }),
    }),
    getArchivedProjects
);

router.put("/:projectId/unarchive",
    authMiddleware,
    validateRequest({
        params: z.object({
            projectId: z.string(),
        }),
    }),
    unarchiveProject
);

router.post("/:workspaceId/create-project",
    authMiddleware,
    validateRequest({
        params: z.object({
            workspaceId: z.string(),
        }),
        body: projectSchema,
    }),
    createProject
);

router.get("/:projectId",
    authMiddleware,
    validateRequest({
        params: z.object({
            projectId: z.string()
        }),
    }),
    getProjectDetails
);

router.get("/:projectId/tasks",
    authMiddleware,
    validateRequest({
        params: z.object({
            projectId: z.string()
        }),
    }),
    getProjectTasks
)

export default router;