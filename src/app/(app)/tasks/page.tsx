"use client";

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";

import {
  Box, Stack, Typography, Paper, Avatar,
  Chip, Button, LinearProgress, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Divider, alpha,
} from "@mui/material";

import Inbox               from "@mui/icons-material/Inbox";
import AccessTime          from "@mui/icons-material/AccessTime";
import ChevronRight        from "@mui/icons-material/ChevronRight";
import TuneRounded         from "@mui/icons-material/TuneRounded";
import TaskAlt             from "@mui/icons-material/TaskAlt";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import RadioButtonChecked  from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import PriorityHighRounded from "@mui/icons-material/PriorityHighRounded";
import RemoveRounded       from "@mui/icons-material/RemoveRounded";
import ArrowDownward       from "@mui/icons-material/ArrowDownward";
import FolderOpenRounded   from "@mui/icons-material/FolderOpenRounded";
import ViewAgendaRounded   from "@mui/icons-material/ViewAgendaRounded";
import ViewKanbanRounded   from "@mui/icons-material/ViewKanbanRounded";

const InboxIcon        = Inbox;
const ClockIcon        = AccessTime;
const ChevronRightIcon = ChevronRight;
const FilterIcon       = TuneRounded;
const CheckIcon        = TaskAlt;
const ErrorIcon        = ErrorOutlineRounded;
const InProgressIcon   = RadioButtonChecked;
const CircleIcon       = RadioButtonUnchecked;
const HighIcon         = PriorityHighRounded;
const MedIcon          = RemoveRounded;
const LowIcon          = ArrowDownward;
const FolderIcon       = FolderOpenRounded;
const GroupedViewIcon  = ViewAgendaRounded;
const KanbanViewIcon   = ViewKanbanRounded;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MyTask {
  _id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "delayed";
  progress: number;
  deadline: string;
  projectId: string;
  projectTitle: string;
  projectStatus: string;
  assignedToName?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:       { label: "Backlog",     color: "default" as const, icon: <CircleIcon sx={{ fontSize: 14 }} /> },
  "in-progress": { label: "In Progress", color: "info" as const,    icon: <InProgressIcon sx={{ fontSize: 14 }} /> },
  completed:     { label: "Completed",   color: "success" as const, icon: <CheckIcon sx={{ fontSize: 14 }} /> },
  delayed:       { label: "Delayed",     color: "error" as const,   icon: <ErrorIcon sx={{ fontSize: 14 }} /> },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "default" as const, icon: <LowIcon sx={{ fontSize: 14 }} />  },
  medium: { label: "Medium", color: "warning" as const, icon: <MedIcon sx={{ fontSize: 14 }} />  },
  high:   { label: "High",   color: "error" as const,   icon: <HighIcon sx={{ fontSize: 14 }} /> },
};

function deadlineMeta(deadline: string, status: string) {
  if (status === "completed") return null;
  const d = new Date(deadline);
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (days < 0)   return { text: `${Math.abs(days)}d overdue`, color: "error.main"   as const, urgent: true };
  if (days === 0) return { text: "Due today",                  color: "error.main"   as const, urgent: true };
  if (days <= 3)  return { text: `Due in ${days}d`,            color: "warning.main" as const, urgent: true };
  return { text: `Due ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
           color: "text.secondary" as const, urgent: false };
}

// ─── Stat tile ───────────────────────────────────────────────────────────────

function StatTile({
  label, value, color, icon,
}: {
  label: string;
  value: number;
  color: "primary" | "info" | "success" | "warning" | "error" | "text.secondary";
  icon: React.ReactNode;
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.25,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar sx={{
        bgcolor: (theme) =>
          color === "text.secondary"
            ? alpha(theme.palette.primary.main, 0.10)
            : alpha((theme.palette[color as "primary"] as any).main, 0.14),
        color: color === "text.secondary" ? "primary.main" : `${color}.main`,
        width: 42, height: 42,
        borderRadius: "12px",
      }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{
          fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums",
          color: color === "text.secondary" ? "text.primary" : `${color}.main`,
        }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

// ─── Task row (Grouped View) ─────────────────────────────────────────────────

function TaskRow({
  task, onUpdate, updating,
}: {
  task: MyTask;
  onUpdate: (id: string, u: { status?: string; progress?: number }) => void;
  updating: string | null;
}) {
  const dl   = deadlineMeta(task.deadline, task.status);
  const busy = updating === task._id;
  const statusCfg   = STATUS_CONFIG[task.status]   ?? STATUS_CONFIG.pending;
  const priorityCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <Box sx={{
      px: 2.5, py: 2, display: "flex", alignItems: "flex-start", gap: 2,
      "&:hover": { bgcolor: "action.hover" },
      transition: "background-color 150ms ease",
    }}>
      {/* Priority dot */}
      <Box sx={{
        mt: 1, width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        bgcolor: task.priority === "high"   ? "error.main"
               : task.priority === "medium" ? "warning.main"
               : "primary.main",
      }} />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="flex-start" gap={2} justifyContent="space-between">
          <Typography variant="body2" sx={{
            fontWeight: 600, lineHeight: 1.4,
            color: task.status === "completed" ? "text.disabled" : "text.primary",
            textDecoration: task.status === "completed" ? "line-through" : "none",
          }}>
            {task.title}
          </Typography>
          {dl && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
              <ClockIcon sx={{ fontSize: 13, color: dl.color }} />
              <Typography variant="caption" sx={{
                color: dl.color, fontWeight: dl.urgent ? 600 : 500,
              }}>
                {dl.text}
              </Typography>
            </Stack>
          )}
        </Stack>

        {task.description && (
          <Typography variant="caption" color="text.secondary" sx={{
            display: "block", mt: 0.5,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {task.description}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={statusCfg.label}
            color={statusCfg.color}
            icon={statusCfg.icon}
            size="small"
            variant="outlined"
            sx={{ height: 22, borderRadius: "999px", "& .MuiChip-icon": { ml: 0.5 } }}
          />
          <Chip
            label={`${priorityCfg.label} Priority`}
            color={priorityCfg.color}
            size="small"
            variant="filled"
            sx={{ height: 22, borderRadius: "999px" }}
          />
          <NextLink href={`/projects/${task.projectId}`} style={{ textDecoration: "none" }}>
            <Stack direction="row" alignItems="center" gap={0.3} sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
              transition: "color 150ms",
            }}>
              <FolderIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>{task.projectTitle}</Typography>
              <ChevronRightIcon sx={{ fontSize: 13 }} />
            </Stack>
          </NextLink>
        </Stack>

        {task.progress > 0 && task.status !== "pending" && (
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 1.5, maxWidth: 320 }}>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              color={task.status === "completed" ? "success" : task.status === "delayed" ? "error" : "primary"}
              sx={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{
              fontFamily: "monospace", fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right", fontWeight: 600,
            }}>
              {task.progress}%
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Controls */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
        <FormControl size="small" sx={{ minWidth: 132 }}>
          <Select
            value={task.status}
            onChange={(e) => onUpdate(task._id, { status: e.target.value })}
            disabled={busy}
            sx={{ height: 32, fontSize: 12, borderRadius: "10px" }}
          >
            <MenuItem value="pending">Backlog</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="delayed">Delayed</MenuItem>
          </Select>
        </FormControl>
        {busy && <CircularProgress size={14} thickness={5} />}
      </Stack>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTasksPage() {
  const [tasks, setTasks]                   = useState<MyTask[]>([]);
  const [loading, setLoading]               = useState(true);
  const [updating, setUpdating]             = useState<string | null>(null);
  const [statusFilter, setStatusFilter]     = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode]             = useState<"grouped" | "kanban">("grouped");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/tasks");
      if (res.ok) setTasks((await res.json()).tasks ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleUpdate = useCallback(
    async (taskId: string, updates: { status?: string; progress?: number }) => {
      setUpdating(taskId);
      setTasks((p) => p.map((t) => (t._id === taskId ? { ...t, ...updates } as MyTask : t)));
      try {
        const r = await fetch(`/api/project-progress/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!r.ok) fetchTasks();
      } catch { fetchTasks(); }
      finally  { setUpdating(null); }
    },
    [fetchTasks]
  );

  const filtered = tasks.filter((t) => {
    if (statusFilter   !== "all" && t.status   !== statusFilter)   return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const overdue = tasks.filter(
    (t) => t.status !== "completed" && new Date(t.deadline) < new Date()
  ).length;

  const byProject = filtered.reduce<Record<string, { title: string; id: string; tasks: MyTask[] }>>((acc, t) => {
    if (!acc[t.projectId]) acc[t.projectId] = { title: t.projectTitle, id: t.projectId, tasks: [] };
    acc[t.projectId].tasks.push(t);
    return acc;
  }, {});

  const kanbanColumns: { key: MyTask["status"]; label: string; dotColor: string }[] = [
    { key: "pending",     label: "Backlog",     dotColor: "#737586" },
    { key: "in-progress", label: "In Progress", dotColor: "#6257E8" },
    { key: "completed",   label: "Completed",   dotColor: "#20B981" },
    { key: "delayed",     label: "Delayed",     dotColor: "#EF4444" },
  ];

  return (
    <Box sx={{ maxWidth: viewMode === "kanban" ? 1180 : 920, mx: "auto", pb: 8 }}>

      {/* Featured SaaS Header Card */}
      <div className="saas-card-featured p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary mb-2">
            Task Management
          </span>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.022em", color: "text.primary" }}>
            My Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track priorities, deadlines, and execution progress across all active projects.
          </Typography>
        </div>

        {/* View switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grouped")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "grouped"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <GroupedViewIcon sx={{ fontSize: 15 }} /> Grouped
          </button>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "kanban"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <KanbanViewIcon sx={{ fontSize: 15 }} /> Kanban
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && tasks.length > 0 && (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3.5,
        }}>
          <StatTile label="Total Tasks" value={tasks.length} color="text.secondary" icon={<CircleIcon />} />
          <StatTile label="In Progress" value={tasks.filter(t => t.status === "in-progress").length} color="info" icon={<InProgressIcon />} />
          <StatTile label="Completed"   value={tasks.filter(t => t.status === "completed").length}   color="success" icon={<CheckIcon />} />
          <StatTile label="Overdue"     value={overdue} color={overdue ? "error" : "text.secondary"} icon={<ErrorIcon />} />
        </Box>
      )}

      {/* Filter bar */}
      {!loading && tasks.length > 0 && (
        <Paper
          elevation={1}
          sx={{
            p: 1.75,
            mb: 3.5,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <FilterIcon sx={{ fontSize: 18, color: "text.secondary", ml: 0.5 }} />
          <FormControl size="small" sx={{ minWidth: 145 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: "10px" }}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="pending">Backlog</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="delayed">Delayed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 145 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)} sx={{ borderRadius: "10px" }}>
              <MenuItem value="all">All priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          {(statusFilter !== "all" || priorityFilter !== "all") && (
            <Button
              size="small"
              onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }}
            >
              Clear filters
            </Button>
          )}
          <Box sx={{ ml: "auto", color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </Box>
        </Paper>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={28} thickness={4} />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper
          elevation={1}
          sx={{
            py: 9,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <InboxIcon sx={{ fontSize: 52, color: "text.disabled" }} />
          <Stack alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>No assignments yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tasks assigned to you across projects will appear here.
            </Typography>
          </Stack>
        </Paper>
      ) : filtered.length === 0 ? (
        <Paper
          elevation={1}
          sx={{
            py: 6,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No tasks match the selected filters.
          </Typography>
        </Paper>
      ) : viewMode === "kanban" ? (
        /* ── Kanban Board View ─────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = filtered.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="saas-card p-3.5 flex flex-col gap-3 bg-background/50">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.dotColor }} />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-muted bg-card border border-border px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[160px]">
                  {colTasks.length === 0 ? (
                    <div className="h-28 rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const dl = deadlineMeta(task.deadline, task.status);
                      const busy = updating === task._id;
                      return (
                        <div key={task._id} className="saas-card p-3.5 space-y-2.5 hover:border-primary/35">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              task.priority === "high" ? "pill-error" : task.priority === "medium" ? "pill-warning" : "pill-neutral"
                            }`}>
                              {task.priority}
                            </span>
                            {dl && (
                              <span className="text-[10.5px] font-medium text-muted">
                                {dl.text}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground leading-snug">
                            {task.title}
                          </p>
                          <NextLink href={`/projects/${task.projectId}`} className="block text-[11px] text-primary hover:underline truncate">
                            {task.projectTitle}
                          </NextLink>
                          {task.progress > 0 && (
                            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                            </div>
                          )}
                          <div className="pt-1 border-t border-border flex items-center justify-between">
                            <select
                              value={task.status}
                              disabled={busy}
                              onChange={(e) => handleUpdate(task._id, { status: e.target.value })}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="pending">Backlog</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="delayed">Delayed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Grouped List View ─────────────────────────────────── */
        <Stack gap={3}>
          {Object.entries(byProject).map(([projectId, { title, tasks: ptasks }]) => (
            <Paper
              key={projectId}
              elevation={2}
              sx={{
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Project header */}
              <Box sx={{
                px: 2.5, py: 1.75,
                bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.primary.main, 0.10) : "#EEECFF",
                borderBottom: 1, borderColor: "divider",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: "50%",
                    bgcolor: "primary.main",
                    boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.16)}`,
                  }} />
                  <NextLink href={`/projects/${projectId}`} style={{ textDecoration: "none" }}>
                    <Typography variant="subtitle2" sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      "&:hover": { color: "primary.main" },
                      transition: "color 150ms",
                    }}>
                      {title}
                    </Typography>
                  </NextLink>
                </Stack>
                <Chip
                  label={`${ptasks.length} task${ptasks.length !== 1 ? "s" : ""}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, borderRadius: "999px", bgcolor: "background.paper" }}
                />
              </Box>

              {/* Tasks */}
              <Stack divider={<Divider />}>
                {ptasks.map((task) => (
                  <TaskRow key={task._id} task={task} onUpdate={handleUpdate} updating={updating} />
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
