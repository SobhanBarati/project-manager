import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetArchivedTasksQuery,
  useUnarchiveTaskMutation,
} from "@/hooks/use-task"; // ✅ اصلاح
import {
  useGetArchivedProjectsQuery,
  useUnarchiveProjectMutation,
} from "@/hooks/use-project"; // ✅ اصلاح
import type { Task, Project } from "@/types";
import { format } from "date-fns";
import { Archive, Calendar, Users } from "lucide-react";
import { useSearchParams } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

const Achieved = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "tasks" | "projects">("all");

  const { data: archivedTasks, isLoading: tasksLoading } =
    useGetArchivedTasksQuery(workspaceId || undefined) as {
      data: Task[];
      isLoading: boolean;
    };

  const { data: archivedProjects, isLoading: projectsLoading } =
    useGetArchivedProjectsQuery() as {
      data: Project[];
      isLoading: boolean;
    };

  const { mutate: unarchiveTask } = useUnarchiveTaskMutation();
  const { mutate: unarchiveProject } = useUnarchiveProjectMutation();

  if (tasksLoading || projectsLoading) {
    return <Loader />;
  }

  const filteredTasks =
    archivedTasks?.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const filteredProjects =
    archivedProjects?.filter((project) =>
      project.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const totalArchived =
    (archivedTasks?.length || 0) + (archivedProjects?.length || 0);

  const handleUnarchiveTask = (taskId: string) => {
    unarchiveTask(taskId, {
      onSuccess: () => {
        toast.success("Task restored successfully");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to restore task");
      },
    });
  };

  const handleUnarchiveProject = (projectId: string) => {
    unarchiveProject(projectId, {
      onSuccess: () => {
        toast.success("Project restored successfully");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to restore project");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="h-6 w-6" />
            Achieved
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalArchived} archived items ({archivedTasks?.length || 0} tasks,{" "}
            {archivedProjects?.length || 0} projects)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search archived items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value || "all")}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="tasks">Tasks</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({archivedTasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects ({archivedProjects?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filter !== "tasks" && filteredProjects.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Projects ({filteredProjects.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <ArchivedProjectCard
                      key={project._id}
                      project={project}
                      onUnarchive={handleUnarchiveProject}
                    />
                  ))}
                </div>
              </div>
            )}

            {filter !== "projects" && filteredTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Tasks ({filteredTasks.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map((task) => (
                    <ArchivedTaskCard
                      key={task._id}
                      task={task}
                      onUnarchive={handleUnarchiveTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredProjects.length === 0 && filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No archived items found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          {filteredTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <ArchivedTaskCard
                  key={task._id}
                  task={task}
                  onUnarchive={handleUnarchiveTask}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No archived tasks</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          {filteredProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ArchivedProjectCard
                  key={project._id}
                  project={project}
                  onUnarchive={handleUnarchiveProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No archived projects</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Archived Project Card
const ArchivedProjectCard = ({
  project,
  onUnarchive,
}: {
  project: Project;
  onUnarchive: (id: string) => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{project.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            Archived
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{project.members?.length || 0} members</span>
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(project.dueDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onUnarchive(project._id)}
        >
          Restore Project
        </Button>
      </CardContent>
    </Card>
  );
};

// Archived Task Card
const ArchivedTaskCard = ({
  task,
  onUnarchive,
}: {
  task: Task;
  onUnarchive: (id: string) => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            Archived
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {task.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge
              variant={task.priority === "High" ? "destructive" : "secondary"}
            >
              {task.priority}
            </Badge>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onUnarchive(task._id)}
        >
          Restore Task
        </Button>
      </CardContent>
    </Card>
  );
};

export default Achieved;