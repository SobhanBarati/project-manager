import { useMutation , useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import { toast } from "sonner";
import type { Workspace } from "@/types";

export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async  ( data: WorkspaceForm) => postData("/workspaces" , data),
    });
};

// workspaces
export const useGetWorkspacesQuery = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => fetchData("/workspaces"),
    });
};

// workspace
// use-workspace.ts
export const useGetWorkspaceQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspaces", workspaceId],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
        enabled: !!workspaceId,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
};

export const useGetWorkspaceStatsQuery = (workspaceId: string ) => {
    return useQuery({
        queryKey: ["workspaces" , workspaceId , "stats"],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
        enabled: !!workspaceId,
        retry: false,
    });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId , "details"],
        queryFn: () => fetchData(`/workspaces/${workspaceId}`),
    });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, {
        token,
      }),
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
  });
};

export const useSetDefaultWorkspace = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (workspaceId: string) =>
            updateData(`/workspaces/${workspaceId}/set-default`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            queryClient.invalidateQueries({ queryKey: ["default-workspace"] });
            toast.success("Default workspace set successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to set default workspace");
        },
    });
};

// دریافت ورک‌اسپیس پیش‌فرض
export const useGetDefaultWorkspace = () => {
    return useQuery({
        queryKey: ["default-workspace"],
        queryFn: () => fetchData<{ defaultWorkspace: Workspace | null }>("/workspaces/default"),
    });
};

// به‌روزرسانی تنظیمات نوتیفیکیشن ورک‌اسپیس
export const useUpdateWorkspaceNotifications = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: {
            enabled?: boolean;
            taskUpdates?: boolean;
            projectUpdates?: boolean;
            memberUpdates?: boolean;
        }) => updateData("/workspaces/notifications", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast.success("Workspace notifications updated");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update notifications");
        },
    });
};

// خروجی گرفتن از داده‌های ورک‌اسپیس
export const useExportWorkspaceData = () => {
    return useMutation({
        mutationFn: (workspaceId: string) =>
            fetchData(`/workspaces/${workspaceId}/export`),
        onSuccess: (data: any) => {
            // دانلود فایل JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `workspace-export-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Workspace data exported successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to export data");
        },
    });
};