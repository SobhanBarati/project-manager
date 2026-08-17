// frontend/app/components/layout/header.tsx

import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, type AppNotification } from "@/hooks/use-notifications";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader } from "../loader";

interface HeaderProps {
    onWorkspaceSelected: (workspace: Workspace) => void;
    selectedWorkspace: Workspace | null;
    onCreateWorkspace: () => void;
}

export const Header = ({
    onWorkspaceSelected,
    selectedWorkspace,
    onCreateWorkspace,
}: HeaderProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { data: workspacesData, isLoading: workspacesLoading } = useGetWorkspacesQuery() as {
        data: Workspace[];
        isLoading: boolean;
    };
    const workspaces = workspacesData || [];
    const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

    // ============ NOTIFICATIONS FROM DATABASE ============
    const { data: notifications, isLoading: notifLoading } = useNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead } = useMarkAllAsRead();

    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications?.filter((n) => !n.read).length || 0;

    const handleMarkAsRead = (id: string) => {
        markAsRead(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const getIcon = (type: AppNotification["type"]) => {
        switch (type) {
            case "task":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "project":
                return <AlertCircle className="h-4 w-4 text-blue-500" />;
            case "workspace":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "mention":
                return <Bell className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const handleOnClick = (workspace: Workspace) => {
        onWorkspaceSelected(workspace);
        const location = window.location;
        if (isOnWorkspacePage) {
            navigate(`/workspaces/${workspace._id}`);
        } else {
            const basePath = location.pathname;
            navigate(`${basePath}?workspaceId=${workspace._id}`);
        }
    };

    if (workspacesLoading) {
        return (
            <div className="bg-background sticky top-0 z-40 border-b">
                <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div className="h-10 w-32 animate-pulse bg-muted rounded" />
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background sticky top-0 z-40 border-b">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                {/* ===== WORKSPACE DROPDOWN ===== */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                        {selectedWorkspace ? (
                            <>
                                {selectedWorkspace.color && (
                                    <WorkspaceAvatar
                                        color={selectedWorkspace.color}
                                        name={selectedWorkspace.name}
                                    />
                                )}
                                <span className="font-medium ml-2">{selectedWorkspace?.name}</span>
                            </>
                        ) : (
                            <span className="font-medium">Select Workspace</span>
                        )}
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="min-w-45">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                            {workspaces.map((ws: Workspace) => (
                                <DropdownMenuItem
                                    key={ws._id}
                                    onClick={() => handleOnClick(ws)}
                                >
                                    {ws.color && (
                                        <WorkspaceAvatar color={ws.color} name={ws.name} />
                                    )}
                                    <span className="ml-2">{ws.name}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onCreateWorkspace}
                                className="whitespace-nowrap flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4 shrink-0" />
                                Create Workspace
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* ===== RIGHT SIDE ===== */}
                <div className="flex items-center gap-2">
                    {/* ===== NOTIFICATION BELL ===== */}
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger 
                            className={cn(
                                "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                "h-9 w-9 px-0",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                "disabled:opacity-50 disabled:pointer-events-none"
                            )}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    className={cn(
                                        "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                                        "bg-red-500 text-white hover:bg-red-600 border-none"
                                    )}
                                >
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </Badge>
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                            {notifLoading ? (
                                <div className="py-8 flex justify-center">
                                    <Loader />
                                </div>
                            ) : (
                                <>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="flex items-center justify-between">
                                            <span>Notifications</span>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs h-7"
                                                    onClick={handleMarkAllAsRead}
                                                >
                                                    Mark all as read
                                                </Button>
                                            )}
                                        </DropdownMenuLabel>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    {!notifications || notifications.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notification: AppNotification) => (
                                            <DropdownMenuItem
                                                key={notification._id}
                                                className={cn(
                                                    "flex flex-col items-start gap-1 py-3 px-4 cursor-pointer",
                                                    !notification.read && "bg-muted/50"
                                                )}
                                                onClick={() => {
                                                    handleMarkAsRead(notification._id);
                                                    if (notification.link) {
                                                        navigate(notification.link);
                                                    }
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-2 w-full">
                                                    {getIcon(notification.type)}
                                                    <span className="font-medium text-sm">
                                                        {notification.title}
                                                    </span>
                                                    {!notification.read && (
                                                        <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground pl-6">
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-muted-foreground pl-6">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}

                                    {notifications && notifications.length > 0 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="justify-center text-center text-sm text-primary cursor-pointer"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    navigate("/dashboard/notifications");
                                                }}
                                            >
                                                View all notifications
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* ===== USER AVATAR ===== */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-full border p-1">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    <Link to="/user/profile" className="w-full">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link to="/settings" className="w-full">
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    Log Out
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};