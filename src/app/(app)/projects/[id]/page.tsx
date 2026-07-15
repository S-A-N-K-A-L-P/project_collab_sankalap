"use client";

import { useState, useEffect, useCallback } from "react";
import NextLink from "next/link";
import { useParams } from "next/navigation";

import {
  Box, Stack, Paper, Card, CardContent, Typography, Chip, Avatar, AvatarGroup,
  Tabs, Tab, LinearProgress, CircularProgress, IconButton, Divider, alpha, Breadcrumbs,
  Link as MuiLink, Button,
} from "@mui/material";

import ArrowBackRounded    from "@mui/icons-material/ArrowBackRounded";
import AccessTimeRounded   from "@mui/icons-material/AccessTimeRounded";
import TaskAlt             from "@mui/icons-material/TaskAlt";            // CheckCircleRounded missing
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import RadioButtonChecked  from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import GitHub              from "@mui/icons-material/GitHub";
import PeopleRounded       from "@mui/icons-material/PeopleRounded";
import TodayRounded        from "@mui/icons-material/TodayRounded";
import TrendingUpRounded   from "@mui/icons-material/TrendingUpRounded";
import DashboardRounded    from "@mui/icons-material/DashboardRounded";
import ChecklistRounded    from "@mui/icons-material/ChecklistRounded";
import GroupRounded        from "@mui/icons-material/GroupRounded";
import TimelineRounded     from "@mui/icons-material/TimelineRounded";
import RuleRounded         from "@mui/icons-material/RuleRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import LaunchRounded       from "@mui/icons-material/LaunchRounded";
const BackIcon      = ArrowBackRounded;
const ClockIcon     = AccessTimeRounded;
const DoneIcon      = TaskAlt;
const ErrorIcon     = ErrorOutlineRounded;
const InProgressIcon = RadioButtonChecked;
const CircleIcon    = RadioButtonUnchecked;
const GitHubIcon    = GitHub;
const PeopleIcon    = PeopleRounded;
const CalendarIcon  = TodayRounded;
const TrendingIcon  = TrendingUpRounded;
const OverviewIcon  = DashboardRounded;
const TasksIcon     = ChecklistRounded;
const TeamIcon      = GroupRounded;
const ActivityIcon  = TimelineRounded;
const ReviewIcon    = RuleRounded;
const ChevronIcon   = ChevronRightRounded;
const ShipIcon      = RocketLaunchRounded;
const ExternalIcon  = LaunchRounded;

import { KanbanBoard, KanbanColumnDef, KanbanTask } from "@/components/tracker/advanced/KanbanBoard";
import MarkCompleteWizard from "@/components/project/MarkCompleteWizard";
import { useSession } from "next-auth/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  _id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  lead?: { _id?: string; name: string; avatar?: string };
  orgId?: { name: string; slug?: string };
  members?: any[];
  techStack?: string[];
  githubRepo?: string;
  createdAt: string;
  completedAt?: string;
  version?: string;
  liveUrl?: string;
}

interface ActivityLogItem {
  _id: string;
  userName?: string;
  action: string;
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS: { id: string; title: string; status: KanbanTask["status"]; accent: string }[] = [
  { id: "backlog",   title: "Backlog",      status: "pending",     accent: "var(--muted-foreground)" },
  { id: "active",    title: "In Progress",  status: "in-progress", accent: "var(--info)" },
  { id: "done",      title: "Completed",    status: "completed",   accent: "var(--success)" },
  { id: "delayed",   title: "Delayed",      status: "delayed",     accent: "var(--error)" },
];

const PROJECT_STATUS_COLOR: Record<string, "success" | "info" | "warning" | "primary" | "default"> = {
  active:     "success",
  planning:   "info",
  completed:  "primary",
  archived:   "default",
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ projectId }: { projectId: string }) {
  const [logs, setLogs]       = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/project-progress/activity?projectId=${projectId}`)
      .then(async (r) => { if (r.ok) setLogs((await r.json()).logs ?? []); })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <Stack direction="row" alignItems="center" gap={1.5} sx={{ py: 4 }}>
      <CircularProgress size={16} thickness={5} />
      <Typography variant="body2" color="text.secondary">Loading activity…</Typography>
    </Stack>
  );

  if (logs.length === 0) return (
    <Paper elevation={0} variant="outlined" sx={{ py: 5, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">
        No activity recorded yet.
      </Typography>
    </Paper>
  );

  return (
    <Stack divider={<Divider />}>
      {logs.map((log) => (
        <Stack key={log._id} direction="row" alignItems="flex-start" gap={2} sx={{ py: 2 }}>
          <Box sx={{
            mt: 1, width: 8, height: 8, borderRadius: "50%",
            bgcolor: "primary.main",
            boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.15)}`,
            flexShrink: 0,
          }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{log.action}</Typography>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
              {log.userName && (
                <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
                  {log.userName}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {new Date(log.createdAt).toLocaleString("en-GB", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  label, value, color, icon,
}: {
  label: string;
  value: number;
  color: "primary" | "info" | "success" | "warning" | "error" | "text.secondary";
  icon: React.ReactNode;
}) {
  return (
    <Paper elevation={2} sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar sx={{
        bgcolor: (t) =>
          color === "text.secondary"
            ? alpha(t.palette.text.secondary, 0.12)
            : alpha((t.palette[color as "primary"] as any).main, 0.16),
        color: color === "text.secondary" ? "text.secondary" : `${color}.main`,
        width: 40, height: 40,
      }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{
          fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums",
          color: color === "text.secondary" ? "text.primary" : `${color}.main`,
        }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id }    = useParams();
  const projectId = id as string;
  const { data: session } = useSession();

  const [project, setProject]         = useState<Project | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
  const [tasks, setTasks]             = useState<KanbanTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [wizardOpen, setWizardOpen]   = useState(false);

  // ── Fetch project ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/projects?id=${projectId}`)
      .then(async (r) => {
        if (r.ok) setProject(await r.json());
        else setProject({
          _id: projectId, title: "Project", status: "active",
          progress: 0, createdAt: new Date().toISOString(),
        });
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  // ── Fetch tasks (lazy) ────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (tasksLoaded) return;
    setTasksLoading(true);
    try {
      const r = await fetch(`/api/project-progress/tasks/project/${projectId}`);
      if (r.ok) setTasks((await r.json()).tasks ?? []);
    } finally { setTasksLoading(false); setTasksLoaded(true); }
  }, [projectId, tasksLoaded]);

  useEffect(() => { if (activeTab === "tasks") fetchTasks(); }, [activeTab, fetchTasks]);

  // ── Task update ───────────────────────────────────────────────
  const handleTaskUpdate = useCallback(
    async (taskId: string, updates: { status?: string; progress?: number }) => {
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...updates } as KanbanTask : t)));
      try {
        const r = await fetch(`/api/project-progress/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!r.ok) { setTasksLoaded(false); fetchTasks(); }
      } catch { setTasksLoaded(false); fetchTasks(); }
    },
    [fetchTasks]
  );

  const kanbanColumns: KanbanColumnDef[] = COLUMNS.map((col) => ({
    ...col, tasks: tasks.filter((t) => t.status === col.status),
  }));

  const taskStats = {
    total:      tasks.length,
    completed:  tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    delayed:    tasks.filter(t => t.status === "delayed").length,
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress size={32} thickness={4} />
    </Box>
  );

  if (!project) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <Typography color="text.secondary">Project not found.</Typography>
    </Box>
  );

  const statusColor = PROJECT_STATUS_COLOR[project.status] ?? "default";
  const initials    = (project.lead?.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const userId      = (session?.user as any)?.id;
  const isLead      = project.lead && (project.lead as any)._id?.toString() === userId;
  const canComplete = isLead && project.status !== "completed" && project.status !== "archived";

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", pb: 8 }}>

      {/* Breadcrumb */}
      <Breadcrumbs separator={<ChevronIcon sx={{ fontSize: 14 }} />} sx={{ mb: 2 }}>
        <MuiLink component={NextLink} href="/feed" underline="hover" color="text.secondary" sx={{ fontSize: 13 }}>
          Home
        </MuiLink>
        <MuiLink component={NextLink} href="/discover" underline="hover" color="text.secondary" sx={{ fontSize: 13 }}>
          Projects
        </MuiLink>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
          {project.title}
        </Typography>
      </Breadcrumbs>

      {/* Completed project banner */}
      {project.status === "completed" && (
        <Paper
          elevation={2}
          sx={{
            p: 2.5, mb: 2, display: "flex", alignItems: "center", gap: 2,
            bgcolor: (t) => alpha(t.palette.success.main, 0.08),
            border: 1, borderColor: "success.main",
            borderRadius: 2,
          }}
        >
          <DoneIcon sx={{ fontSize: 28, color: "success.main" }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "success.dark" }}>
              Project completed{project.version ? ` — ${project.version}` : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {project.completedAt && `Shipped ${new Date(project.completedAt).toLocaleDateString("en-GB", { day:"numeric",month:"short",year:"numeric"})}`}
            </Typography>
          </Box>
          <Button
            component={NextLink}
            href={`/showcase/${project._id}`}
            variant="outlined"
            color="success"
            size="small"
            startIcon={<ExternalIcon sx={{ fontSize: 14 }} />}
          >
            View in Showcase
          </Button>
        </Paper>
      )}

      {/* Hero card */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems="flex-start" gap={3} justifyContent="space-between">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
              {project.orgId && (
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  {project.orgId.name}
                </Typography>
              )}
              <Chip
                label={project.status}
                color={statusColor}
                size="small"
                variant="filled"
                sx={{ height: 22, textTransform: "capitalize", fontWeight: 600 }}
              />
            </Stack>

            <Typography variant="h4" sx={{
              fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, mb: 1.5,
            }}>
              {project.title}
            </Typography>

            {project.description && (
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.6 }}>
                {project.description}
              </Typography>
            )}

            {/* Tech stack */}
            {project.techStack && project.techStack.length > 0 && (
              <Stack direction="row" gap={0.75} sx={{ mt: 2, flexWrap: "wrap" }}>
                {project.techStack.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                ))}
              </Stack>
            )}
          </Box>

          {/* Right column — lead + meta */}
          <Stack gap={1.5} alignItems="flex-end" sx={{ flexShrink: 0 }}>
            {project.lead && (
              <Stack direction="row" alignItems="center" gap={1.25}>
                <Avatar
                  src={project.lead.avatar}
                  sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}
                >
                  {initials}
                </Avatar>
                <Stack alignItems="flex-end">
                  <Typography variant="caption" color="text.secondary">Lead</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {project.lead.name}
                  </Typography>
                </Stack>
              </Stack>
            )}

            <Stack direction="row" gap={2} sx={{ color: "text.secondary" }}>
              {project.members && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <PeopleIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">{project.members.length} members</Typography>
                </Stack>
              )}
              {project.githubRepo && (
                <MuiLink
                  href={project.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.5,
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <GitHubIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">Repo</Typography>
                </MuiLink>
              )}
              <Stack direction="row" alignItems="center" gap={0.5}>
                <CalendarIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {new Date(project.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* Progress + Mark Complete */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Stack direction="row" alignItems="center" gap={0.75}>
              <TrendingIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Overall progress
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontFamily: "monospace", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {project.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            color={
              project.progress >= 100 ? "success" :
              project.progress >= 60  ? "primary" :
              project.progress >= 30  ? "warning" : "error"
            }
            sx={{ height: 6, borderRadius: 3 }}
          />

          {canComplete && (
            <Box sx={{ mt: 2.5, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="success"
                size="medium"
                startIcon={<ShipIcon />}
                onClick={() => setWizardOpen(true)}
                sx={{ fontWeight: 600 }}
              >
                Mark Project Complete
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Completion wizard */}
      <MarkCompleteWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        projectId={project._id}
        projectTitle={project.title}
        githubRepo={project.githubRepo}
        defaultEmail={(session?.user as any)?.email}
        onSuccess={() => {
          // refetch project to update status
          fetch(`/api/projects?id=${project._id}`).then(async (r) => {
            if (r.ok) setProject(await r.json());
          });
        }}
      />

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1, borderColor: "divider",
            "& .MuiTab-root": { minHeight: 52, gap: 1 },
            "& .Mui-selected": { fontWeight: 600 },
          }}
        >
          <Tab value="overview"     icon={<OverviewIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" />
          <Tab value="tasks"        icon={<TasksIcon    sx={{ fontSize: 18 }} />} iconPosition="start" label="Tasks" />
          <Tab value="contributors" icon={<TeamIcon     sx={{ fontSize: 18 }} />} iconPosition="start" label="Team" />
          <Tab value="activity"     icon={<ActivityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Activity" />
          <Tab value="verification" icon={<ReviewIcon   sx={{ fontSize: 18 }} />} iconPosition="start" label="Review" />
        </Tabs>
      </Paper>

      {/* Tab content */}
      <Box>
        {/* ── OVERVIEW ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <Stack gap={3}>
            {/* Task summary */}
            {tasksLoaded && tasks.length > 0 ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                <StatTile label="Total Tasks" value={taskStats.total}      color="text.secondary" icon={<CircleIcon />} />
                <StatTile label="In Progress" value={taskStats.inProgress}  color="info"           icon={<InProgressIcon />} />
                <StatTile label="Completed"   value={taskStats.completed}   color="success"        icon={<DoneIcon />} />
                <StatTile label="Delayed"     value={taskStats.delayed}     color={taskStats.delayed > 0 ? "error" : "text.secondary"} icon={<ErrorIcon />} />
              </Box>
            ) : null}

            {project.description && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>About this project</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {project.description}
                </Typography>
              </Paper>
            )}

            {/* Quick details */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Details</Typography>
              <Stack divider={<Divider />}>
                {[
                  { label: "Status",       value: <Chip label={project.status} size="small" color={statusColor} sx={{ textTransform: "capitalize", height: 22 }} /> },
                  { label: "Progress",     value: `${project.progress}%` },
                  { label: "Lead",         value: project.lead?.name ?? "Unassigned" },
                  { label: "Organisation", value: project.orgId?.name ?? "—" },
                  { label: "Members",      value: project.members?.length ?? 0 },
                  { label: "Created",      value: new Date(project.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Box sx={{ fontWeight: 500, fontSize: 13 }}>{value}</Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* ── TASKS ────────────────────────────────────────────── */}
        {activeTab === "tasks" && (
          <Stack gap={3}>
            {tasks.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                <StatTile label="Total"       value={taskStats.total}      color="text.secondary" icon={<CircleIcon />} />
                <StatTile label="In Progress" value={taskStats.inProgress}  color="info"           icon={<InProgressIcon />} />
                <StatTile label="Completed"   value={taskStats.completed}   color="success"        icon={<DoneIcon />} />
                <StatTile label="Delayed"     value={taskStats.delayed}     color={taskStats.delayed > 0 ? "error" : "text.secondary"} icon={<ErrorIcon />} />
              </Box>
            )}

            {tasksLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} thickness={4} />
              </Box>
            ) : (
              <Paper elevation={1} sx={{ p: 2 }}>
                <KanbanBoard columns={kanbanColumns} onTaskUpdate={handleTaskUpdate} />
              </Paper>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                component={NextLink}
                href={`/projects/${projectId}/tasks`}
                endIcon={<ChevronIcon />}
                size="small"
              >
                View full task list
              </Button>
            </Box>
          </Stack>
        )}

        {/* ── ACTIVITY ─────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Activity Log</Typography>
              <Button
                component={NextLink}
                href={`/projects/${projectId}/activity`}
                endIcon={<ChevronIcon />}
                size="small"
              >
                Full log
              </Button>
            </Stack>
            <ActivityFeed projectId={projectId} />
          </Paper>
        )}

        {/* ── TEAM ─────────────────────────────────────────────── */}
        {activeTab === "contributors" && (
          <Paper elevation={1} sx={{ py: 6, textAlign: "center" }}>
            <PeopleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Team management is handled in the admin panel.
            </Typography>
            <Button
              component={NextLink}
              href="/admin"
              variant="outlined"
              size="small"
              endIcon={<ChevronIcon />}
            >
              Go to Admin
            </Button>
          </Paper>
        )}

        {/* ── REVIEW ────────────────────────────────────────────── */}
        {activeTab === "verification" && (
          <Paper elevation={1} sx={{ py: 6, textAlign: "center" }}>
            <ReviewIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Review and verification coming soon.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
