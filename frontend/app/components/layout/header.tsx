import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle } from "lucide-react";
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
import { Link, useLoaderData } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

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

    const { user, logout } = useAuth();
    const { workspaces } = useLoaderData() as { workspaces: Workspace[] };

    return (
        <div className="bg-background sticky top-0 z-40 border-b">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                <DropdownMenu>
                    {/* ✅ DropdownMenuTrigger با استایل مستقیم - بدون Button اضافی */}
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

                    <DropdownMenuContent align="end" className="min-w-[180px]">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            {workspaces.map((ws) => (
                                <DropdownMenuItem
                                    key={ws._id}
                                    onClick={() => onWorkspaceSelected(ws)}
                                >
                                    {ws.color && (
                                        <WorkspaceAvatar color={ws.color} name={ws.name} />
                                    )}
                                    <span className="ml-2">{ws.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
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

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>

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
                            </DropdownMenuGroup>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Link to="/user/profile" className="w-full">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuGroup>
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