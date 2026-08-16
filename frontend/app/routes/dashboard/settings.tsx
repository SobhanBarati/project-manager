// routes/dashboard/settings.tsx

import { useState } from "react";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/provider/auth-context";
import { useTheme } from "@/hooks/use-theme";
import {
  useUserProfileQuery,
  useUserSettingsQuery,
  useUpdateUserSettings,
} from "@/hooks/use-user";
import {
  useGetDefaultWorkspace,
  useSetDefaultWorkspace,
  useUpdateWorkspaceNotifications,
  useExportWorkspaceData,
  useGetWorkspacesQuery,
} from "@/hooks/use-workspace";
import type { UserSettings, Workspace } from "@/types";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Users,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// ============ SCHEMAS ============

const profileSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const notificationSettingsSchema = z.object({
  taskAssignments: z.boolean(),
  taskUpdates: z.boolean(),
  projectUpdates: z.boolean(),
  workspaceInvites: z.boolean(),
  emailNotifications: z.boolean(),
});

const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  compactView: z.boolean(),
});

type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;
type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
type AppearanceSettingsData = z.infer<typeof appearanceSettingsSchema>;

// ============ COMPONENT ============

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // User Queries
  const { data: userData, isLoading: userLoading } = useUserProfileQuery();
  const { data: settings, isLoading: settingsLoading } = useUserSettingsQuery() as {
    data: UserSettings;
    isLoading: boolean;
  };
  const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateUserSettings();

  // Workspace Queries & Mutations
  const { data: workspacesData, isLoading: workspacesLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };
  const { data: defaultWorkspaceData } = useGetDefaultWorkspace();
  const { mutate: setDefaultWorkspace, isPending: isSettingDefault } = useSetDefaultWorkspace();
  const { mutate: updateWorkspaceNotifications, isPending: isUpdatingWorkspaceNotif } =
    useUpdateWorkspaceNotifications();
  const { mutate: exportWorkspaceData, isPending: isExporting } = useExportWorkspaceData();

  // State
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [workspaceNotifSettings, setWorkspaceNotifSettings] = useState({
    enabled: true,
    taskUpdates: true,
    projectUpdates: true,
    memberUpdates: true,
  });

  // ============ FORMS ============

  // Profile Form
  const profileForm = useForm<ProfileSettingsData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Notification Form
  const notificationForm = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      taskAssignments: settings?.notifications?.taskAssignments ?? true,
      taskUpdates: settings?.notifications?.taskUpdates ?? true,
      projectUpdates: settings?.notifications?.projectUpdates ?? true,
      workspaceInvites: settings?.notifications?.workspaceInvites ?? true,
      emailNotifications: settings?.notifications?.emailNotifications ?? true,
    },
  });

  // Appearance Form
  const appearanceForm = useForm<AppearanceSettingsData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      theme: settings?.appearance?.theme || "system",
      compactView: settings?.appearance?.compactView || false,
    },
  });

  // ============ HANDLERS ============

  // Profile Submit
  const onProfileSubmit = (data: ProfileSettingsData) => {
    toast.success("Profile settings saved!");
  };

  // Notification Submit
  const onNotificationSubmit = (data: NotificationSettingsData) => {
    updateSettings(
      { notifications: data },
      {
        onSuccess: () => {
          toast.success("Notification settings saved!");
        },
        onError: () => {
          toast.error("Failed to save notification settings");
        },
      }
    );
  };

  // Appearance Submit
  const onAppearanceSubmit = (data: AppearanceSettingsData) => {
    setTheme(data.theme);

    updateSettings(
      { appearance: data },
      {
        onSuccess: () => {
          toast.success("Appearance settings saved!");
        },
        onError: () => {
          toast.error("Failed to save appearance settings");
        },
      }
    );
  };

  // Theme Change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);

    updateSettings(
      { appearance: { ...appearanceForm.getValues(), theme: newTheme } },
      {
        onSuccess: () => {
          toast.success(`Theme changed to ${newTheme}!`);
        },
        onError: () => {
          toast.error("Failed to save theme preference");
        },
      }
    );
  };

  // Default Workspace
  const handleSetDefaultWorkspace = () => {
    if (selectedWorkspaceId) {
      setDefaultWorkspace(selectedWorkspaceId);
    } else {
      toast.error("Please select a workspace");
    }
  };

  // Export Workspace Data
  const handleExportWorkspace = () => {
    if (selectedWorkspaceId) {
      exportWorkspaceData(selectedWorkspaceId);
    } else {
      toast.error("Please select a workspace first");
    }
  };

  // ============ LOADING ============

  if (userLoading || settingsLoading || workspacesLoading) {
    return <Loader />;
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and settings
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Current theme: <span className="font-medium capitalize">{theme}</span>
          {resolvedTheme && (
            <span className="ml-1 text-xs">
              (resolved: {resolvedTheme})
            </span>
          )}
        </p>
      </div>

      <Separator />

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workspace
          </TabsTrigger>
        </TabsList>

        {/* ============ PROFILE TAB ============ */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Email address cannot be changed
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Save Profile</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ NOTIFICATIONS TAB ============ */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={notificationForm.control}
                    name="taskAssignments"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Task Assignments</FormLabel>
                          <FormDescription>
                            When you're assigned to a task
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="taskUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Task Updates</FormLabel>
                          <FormDescription>
                            When a task you're assigned to is updated
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="projectUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Project Updates</FormLabel>
                          <FormDescription>
                            When a project you're in is updated
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="workspaceInvites"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Workspace Invites</FormLabel>
                          <FormDescription>
                            When you're invited to a workspace
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdatingSettings}>
                    {isUpdatingSettings ? "Saving..." : "Save Notifications"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ APPEARANCE TAB ============ */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how TaskHub looks for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appearanceForm}>
                <form
                  onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={appearanceForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <FormControl>
                          <div className="flex gap-4 flex-wrap">
                            <Button
                              type="button"
                              variant={field.value === "light" ? "default" : "outline"}
                              className="flex items-center gap-2"
                              onClick={() => {
                                field.onChange("light");
                                handleThemeChange("light");
                              }}
                            >
                              <Sun className="h-4 w-4" />
                              Light
                            </Button>

                            <Button
                              type="button"
                              variant={field.value === "dark" ? "default" : "outline"}
                              className="flex items-center gap-2"
                              onClick={() => {
                                field.onChange("dark");
                                handleThemeChange("dark");
                              }}
                            >
                              <Moon className="h-4 w-4" />
                              Dark
                            </Button>

                            <Button
                              type="button"
                              variant={field.value === "system" ? "default" : "outline"}
                              className="flex items-center gap-2"
                              onClick={() => {
                                field.onChange("system");
                                handleThemeChange("system");
                              }}
                            >
                              <Monitor className="h-4 w-4" />
                              System
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choose light, dark, or system default theme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appearanceForm.control}
                    name="compactView"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Compact View</FormLabel>
                          <FormDescription>
                            Show more content with compact spacing
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdatingSettings}>
                    {isUpdatingSettings ? "Saving..." : "Save Appearance"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ WORKSPACE TAB ============ */}
        <TabsContent value="workspace">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Manage your workspace preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Workspace */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <h4 className="font-medium">Default Workspace</h4>
                  <p className="text-sm text-muted-foreground">
                    Set your default workspace when logging in
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current:{" "}
                    <span className="font-medium">
                      {defaultWorkspaceData?.defaultWorkspace?.name || "None set"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <select
                    className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto bg-background"
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  >
                    <option value="">Select workspace...</option>
                    {workspacesData?.map((ws: Workspace) => (
                      <option key={ws._id} value={ws._id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    onClick={handleSetDefaultWorkspace}
                    disabled={!selectedWorkspaceId || isSettingDefault}
                    className="w-full sm:w-auto"
                  >
                    {isSettingDefault ? "Setting..." : "Set Default"}
                  </Button>
                </div>
              </div>

              {/* Workspace Notifications */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Workspace Notifications</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage notifications for all workspaces
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Enable notifications</label>
                    <Switch
                      checked={workspaceNotifSettings.enabled}
                      onCheckedChange={(checked) => {
                        setWorkspaceNotifSettings((prev) => ({
                          ...prev,
                          enabled: checked,
                        }));
                        updateWorkspaceNotifications({ enabled: checked });
                      }}
                      disabled={isUpdatingWorkspaceNotif}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Task updates</label>
                    <Switch
                      checked={workspaceNotifSettings.taskUpdates}
                      onCheckedChange={(checked) => {
                        setWorkspaceNotifSettings((prev) => ({
                          ...prev,
                          taskUpdates: checked,
                        }));
                        updateWorkspaceNotifications({ taskUpdates: checked });
                      }}
                      disabled={isUpdatingWorkspaceNotif}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Project updates</label>
                    <Switch
                      checked={workspaceNotifSettings.projectUpdates}
                      onCheckedChange={(checked) => {
                        setWorkspaceNotifSettings((prev) => ({
                          ...prev,
                          projectUpdates: checked,
                        }));
                        updateWorkspaceNotifications({ projectUpdates: checked });
                      }}
                      disabled={isUpdatingWorkspaceNotif}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Member updates</label>
                    <Switch
                      checked={workspaceNotifSettings.memberUpdates}
                      onCheckedChange={(checked) => {
                        setWorkspaceNotifSettings((prev) => ({
                          ...prev,
                          memberUpdates: checked,
                        }));
                        updateWorkspaceNotifications({ memberUpdates: checked });
                      }}
                      disabled={isUpdatingWorkspaceNotif}
                    />
                  </div>
                </div>
              </div>

              {/* Export Data */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Export all your workspace data as JSON
                  </p>
                  {selectedWorkspaceId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Workspace:{" "}
                      <span className="font-medium">
                        {workspacesData?.find((ws: Workspace) => ws._id === selectedWorkspaceId)
                          ?.name || "Unknown"}
                      </span>
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportWorkspace}
                  disabled={isExporting || !selectedWorkspaceId}
                  className="w-full md:w-auto"
                >
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;