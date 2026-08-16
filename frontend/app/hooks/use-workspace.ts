import { useMutation , useQuery } from "@tanstack/react-query";
import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData } from "@/lib/fetch-util";

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