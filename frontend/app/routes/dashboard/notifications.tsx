// frontend/app/routes/dashboard/notifications.tsx

import { useNotifications, useMarkAsRead, useMarkAllAsRead, type AppNotification } from "@/hooks/use-notifications";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, AlertCircle, Check, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const Notifications = () => {
    const navigate = useNavigate();
    const { data: notifications, isLoading, refetch } = useNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead } = useMarkAllAsRead();

    const handleMarkAsRead = (id: string) => {
        markAsRead(id, {
            onSuccess: () => {
                refetch();
                toast.success("Notification marked as read");
            },
            onError: () => {
                toast.error("Failed to mark as read");
            },
        });
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead(undefined, {
            onSuccess: () => {
                refetch();
                toast.success("All notifications marked as read");
            },
            onError: () => {
                toast.error("Failed to mark all as read");
            },
        });
    };

    const getIcon = (type: AppNotification["type"]) => {
        switch (type) {
            case "task":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "project":
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case "workspace":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case "mention":
                return <Bell className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }
        
        if (notification.link) {
            navigate(notification.link);
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        Notifications
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {unreadCount} unread notifications
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>
                        {notifications?.length || 0} notifications in total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!notifications || notifications.length === 0 ? (
                        <div className="py-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                                        !notification.read && "bg-muted/30 border-blue-200"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-medium">
                                                {notification.title}
                                            </h4>
                                            {!notification.read && (
                                                <Badge variant="default" className="text-xs bg-blue-500">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                            {notification.read && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Read
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification._id);
                                            }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Notifications;