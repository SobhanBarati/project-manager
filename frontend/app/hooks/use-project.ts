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
