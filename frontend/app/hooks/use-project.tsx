import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/lib/fetch-util";
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
