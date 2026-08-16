import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData } from "@/lib/fetch-util";
import type { CreateProjectFormData } from "@/components/project/create-project"; 

export const UseCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            projectData: CreateProjectFormData;
            workspaceId: string;
        }) => 
            postData(
                `/projects/${data.workspaceId}/create-project`,
                data.projectData
            ),
            onSuccess: (data: any) => {
                queryClient.invalidateQueries({
                    queryKey: ["workspace", data.workspace],
                });
            },
        }
    );
};

export const UseProjectQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            const data = await fetchData(`/projects/${projectId}/tasks`);
            return data;
        },
        enabled: !!projectId,
        retry: false,
    });
};

export const useGetArchivedProjectsQuery = (workspaceId?: string) => {
    return useQuery({
        queryKey: ["archived-projects", workspaceId],
        queryFn: async () => {
            if (!workspaceId) {
                return [];
            }
            const response = await fetchData(`/projects/archived?workspaceId=${workspaceId}`);
            return response;
        },
        enabled: !!workspaceId, 
    });
};

export const useArchiveProjectMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) =>
            postData(`/projects/${projectId}/archive`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["archived-projects"],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspace"],
            });
        },
    });
};

// hooks/use-project.ts

export const useUnarchiveProjectMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) =>
            postData(`/projects/${projectId}/unarchive`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["archived-projects"],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspace"],
            });
            queryClient.invalidateQueries({
                queryKey: ["project"],
            });
        },
    });
};