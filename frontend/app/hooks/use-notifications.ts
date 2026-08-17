// frontend/app/hooks/use-notifications.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData, updateData } from "@/lib/fetch-util";

export interface AppNotification {
    _id: string;
    title: string;
    message: string;
    type: "task" | "project" | "workspace" | "mention";
    read: boolean;
    createdAt: string;
    link?: string;
}

export const useNotifications = () => {
    return useQuery<AppNotification[]>({
        queryKey: ["notifications"],
        queryFn: () => fetchData<AppNotification[]>("/notifications"),
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (notificationId: string) =>
            updateData(`/notifications/${notificationId}/read`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: () =>
            updateData("/notifications/read-all", {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};