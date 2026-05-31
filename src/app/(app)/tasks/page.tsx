"use client";

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";

import {
  Box, Stack, Typography, Paper, Card, CardContent, Avatar, AvatarGroup,
  Chip, Button, IconButton, LinearProgress, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Divider,
  TextField, InputAdornment, Tooltip, alpha,
} from "@mui/material";

import Inbox                from "@mui/icons-material/Inbox";
import AccessTime            from "@mui/icons-material/AccessTime";
import ChevronRight          from "@mui/icons-material/ChevronRight";
import TuneRounded           from "@mui/icons-material/TuneRounded";
import CheckCircleRounded    from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRounded   from "@mui/icons-material/ErrorOutlineRounded";
import RadioButtonChecked    from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUnchecked  from "@mui/icons-material/RadioButtonUnchecked";
import PriorityHighRounded   from "@mui/icons-material/PriorityHighRounded";
import RemoveRounded         from "@mui/icons-material/RemoveRounded";
import ArrowDownwardRounded  from "@mui/icons-material/ArrowDownwardRounded";
import FolderOpenRounded     from "@mui/icons-material/FolderOpenRounded";
const InboxIcon        = Inbox;
const ClockIcon        = AccessTime;
const ChevronRightIcon = ChevronRight;
const FilterIcon       = TuneRounded;
const CheckIcon        = CheckCircleRounded;
const ErrorIcon        = ErrorOutlineRounded;
const InProgressIcon   = RadioButtonChecked;
const CircleIcon       = RadioButtonUnchecked;
const HighIcon         = PriorityHighRounded;
const MedIcon          = RemoveRounded;
const LowIcon          = ArrowDownwardRounded;
const FolderIcon       = FolderOpenRounded;

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
  pending:      { label: "Backlog",     color: "default" as const, icon: <CircleIcon sx={{ fontSize: 14 }} /> },
  "in-progress":{ label: "In Progress", color: "info" as const,    icon: <InProgressIcon sx={{ fontSize: 14 }} /> },
  completed:    { label: "Completed",   color: "success" as const, icon: <CheckIcon sx={{ fontSize: 14 }} /> },
  delayed:      { label: "Delayed",     color: "error" as const,   icon: <ErrorIcon sx={{ fontSize: 14 }} /> },
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

// ─── Stat tile — real MUI Paper with elevation ───────────────────────────────

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
        bgcolor: (theme) =>
          color === "text.secondary"
            ? alpha(theme.palette.text.secondary, 0.12)
            : alpha((theme.palette[color as "primary"] as any).main, 0.16),
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

// ─── Task row ────────────────────────────────────────────────────────────────

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
      "&:hover": { bgcolor: (t) => alpha(t.palette.text.primary, 0.03) },
      transition: "background-color 150ms ease",
      "& .row-actions": { opacity: 0, transition: "opacity 150ms ease" },
      "&:hover .row-actions": { opacity: 1 },
    }}>
      {/* Priority dot */}
      <Box sx={{
        mt: 1, width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        bgcolor: task.priority === "high"   ? "error.main"
               : task.priority === "medium" ? "warning.main"
               : "text.disabled",
      }} />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="flex-start" gap={2} justifyContent="space-between">
          <Typography variant="body2" sx={{
            fontWeight: 500, lineHeight: 1.4,
            color: task.status === "completed" ? "text.disabled" : "text.primary",
            textDecoration: task.status === "completed" ? "line-through" : "none",
          }}>
            {task.title}
          </Typography>
          {dl && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
              <ClockIcon sx={{ fontSize: 13, color: dl.color }} />
              <Typography variant="caption" sx={{
                color: dl.color, fontWeight: dl.urgent ? 500 : 400,
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
            sx={{ height: 22, "& .MuiChip-icon": { ml: 0.5 } }}
          />
          <Chip
            label={priorityCfg.label}
            color={priorityCfg.color}
            size="small"
            variant="filled"
            sx={{ height: 22 }}
          />
          <NextLink href={`/projects/${task.projectId}`} style={{ textDecoration: "none" }}>
            <Stack direction="row" alignItems="center" gap={0.3} sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
              transition: "color 150ms",
            }}>
              <FolderIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption">{task.projectTitle}</Typography>
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
              fontFamily: "monospace", fontVariantNumeric: "tabular-nums", minWidth: 30, textAlign: "right",
            }}>
              {task.progress}%
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Controls */}
      <Stack className="row-actions" direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={task.status}
            onChange={(e) => onUpdate(task._id, { status: e.target.value })}
            disabled={busy}
            sx={{ height: 32, fontSize: 12 }}
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
  const [tasks, setTasks]               = useState<MyTask[]>([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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

  return (
    <Box sx={{ maxWidth: 880, mx: "auto", pb: 8 }}>

      {/* Header */}
      <Stack gap={0.5} sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
          My Assignments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tasks assigned to you across all active projects.
        </Typography>
      </Stack>

      {/* Stats */}
      {!loading && tasks.length > 0 && (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 4,
        }}>
          <StatTile label="Total"       value={tasks.length} color="text.secondary" icon={<CircleIcon />} />
          <StatTile label="In Progress" value={tasks.filter(t => t.status === "in-progress").length} color="info" icon={<InProgressIcon />} />
          <StatTile label="Completed"   value={tasks.filter(t => t.status === "completed").length}   color="success" icon={<CheckIcon />} />
          <StatTile label="Overdue"     value={overdue} color={overdue ? "error" : "text.secondary"} icon={<ErrorIcon />} />
        </Box>
      )}

      {/* Filter bar */}
      {!loading && tasks.length > 0 && (
        <Paper elevation={1} sx={{ p: 1.5, mb: 3, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <FilterIcon sx={{ fontSize: 18, color: "text.secondary", ml: 0.5 }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="pending">Backlog</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="delayed">Delayed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
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
          <Box sx={{ ml: "auto", color: "text.secondary", fontSize: 12 }}>
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </Box>
        </Paper>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={28} thickness={4} />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper elevation={1} sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <InboxIcon sx={{ fontSize: 56, color: "text.disabled" }} />
          <Stack alignItems="center">
            <Typography variant="subtitle1" fontWeight={500}>No assignments yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tasks assigned to you will appear here.
            </Typography>
          </Stack>
        </Paper>
      ) : filtered.length === 0 ? (
        <Paper elevation={1} sx={{ py: 5, display: "flex", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No tasks match the selected filters.
          </Typography>
        </Paper>
      ) : (
        <Stack gap={3}>
          {Object.entries(byProject).map(([projectId, { title, tasks: ptasks }]) => (
            <Paper key={projectId} elevation={3} sx={{ overflow: "hidden" }}>
              {/* Project header */}
              <Box sx={{
                px: 2.5, py: 1.75,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
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
                      fontWeight: 600,
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
                  sx={{ height: 22 }}
                />
              </Box>

              {/* Tasks */}
              <Divider />
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
