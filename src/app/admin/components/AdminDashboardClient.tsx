"use client";

import NextLink from "next/link";
import {
  Box, Stack, Paper, Typography, Avatar, Chip, Divider,
  LinearProgress, IconButton, alpha, Link as MuiLink,
} from "@mui/material";

import PeopleAltRounded          from "@mui/icons-material/PeopleAltRounded";
import DescriptionRounded        from "@mui/icons-material/DescriptionRounded";
import FolderRounded             from "@mui/icons-material/FolderRounded";
import AssignmentTurnedIn        from "@mui/icons-material/AssignmentTurnedIn";    // Rounded missing
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import TrendingUpRounded         from "@mui/icons-material/TrendingUpRounded";
import ArrowForward              from "@mui/icons-material/ArrowForward";           // Rounded missing
import ThumbUpRounded            from "@mui/icons-material/ThumbUpRounded";
const UsersIcon  = PeopleAltRounded;
const DocIcon    = DescriptionRounded;
const FolderIcon = FolderRounded;
const TaskIcon   = AssignmentTurnedIn;
const AdminIcon  = AdminPanelSettingsRounded;
const TrendIcon  = TrendingUpRounded;
const ArrowIcon  = ArrowForward;
const UpvoteIcon = ThumbUpRounded;

interface Stats {
  totalUsers: number;
  totalProposals: number;
  activeProposals: number;
  pendingProposals: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  adminCount: number;
  recentUsers: any[];
  recentProposals: any[];
}

// ─── Big stat card ────────────────────────────────────────────────────────────

function BigStat({
  label, value, sub, icon, color, href,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "info" | "warning" | "error";
  href?: string;
}) {
  const Wrapper: any = href ? NextLink : "div";

  return (
    <Paper
      component={Wrapper}
      href={href}
      elevation={2}
      sx={{
        p: 2.5,
        textDecoration: "none", color: "inherit", display: "block",
        position: "relative", overflow: "hidden",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": href ? {
          transform: "translateY(-2px)",
          boxShadow: 4,
          "& .arrow": { opacity: 1, transform: "translateX(0)" },
        } : {},
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Avatar sx={{
          width: 40, height: 40,
          bgcolor: (t) => alpha(t.palette[color].main, 0.16),
          color: `${color}.main`,
        }}>
          {icon}
        </Avatar>
        {href && (
          <ArrowIcon
            className="arrow"
            sx={{
              fontSize: 18, color: "text.disabled",
              opacity: 0.4, transform: "translateX(-4px)",
              transition: "all 200ms ease",
            }}
          />
        )}
      </Stack>
      <Typography variant="h4" sx={{
        fontWeight: 700, lineHeight: 1, mb: 0.5, fontVariantNumeric: "tabular-nums",
      }}>
        {value.toLocaleString()}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

// ─── KPI bar ──────────────────────────────────────────────────────────────────

function KpiBar({ stats }: { stats: Stats }) {
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const approvalRate = stats.totalProposals > 0
    ? Math.round((stats.activeProposals / stats.totalProposals) * 100)
    : 0;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={4} divider={<Divider orientation="vertical" flexItem />}>
        {/* Task completion */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <TaskIcon sx={{ fontSize: 18, color: "success.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Task completion</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600, color: "success.main" }}>
              {completionRate}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            color="success"
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </Typography>
        </Box>

        {/* Proposal approval */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <TrendIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Approval rate</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600, color: "primary.main" }}>
              {approvalRate}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={approvalRate}
            color="primary"
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
            {stats.activeProposals} of {stats.totalProposals} proposals active
          </Typography>
        </Box>

        {/* Pending review */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <DocIcon sx={{ fontSize: 18, color: "warning.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Awaiting review</Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "warning.main", lineHeight: 1 }}>
              {stats.pendingProposals}
            </Typography>
          </Stack>
          <MuiLink
            component={NextLink}
            href="/admin/proposals?status=proposal"
            sx={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
          >
            Review now <ArrowIcon sx={{ fontSize: 14 }} />
          </MuiLink>
        </Box>
      </Stack>
    </Paper>
  );
}

// ─── List card ────────────────────────────────────────────────────────────────

function ListCard({
  title, viewAllHref, items,
}: {
  title: string;
  viewAllHref: string;
  items: React.ReactNode;
}) {
  return (
    <Paper elevation={2} sx={{ overflow: "hidden" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
        <MuiLink
          component={NextLink}
          href={viewAllHref}
          sx={{
            fontSize: 12, fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 0.5,
          }}
        >
          View all <ArrowIcon sx={{ fontSize: 14 }} />
        </MuiLink>
      </Stack>
      <Stack divider={<Divider />}>{items}</Stack>
    </Paper>
  );
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user }: { user: any }) {
  const initials = (user.name || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const roleColor: any = user.role === "master_admin" ? "error"
    : user.role === "sankalp_associate" ? "primary"
    : user.role === "sankalp_member" ? "info"
    : "default";

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      component={NextLink}
      href={`/admin/users/${user._id}`}
      sx={{
        px: 3, py: 1.5,
        textDecoration: "none", color: "inherit",
        "&:hover": { bgcolor: (t) => alpha(t.palette.text.primary, 0.03) },
        transition: "background-color 150ms",
      }}
    >
      <Avatar src={user.avatar} sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: "primary.main" }}>
        {initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
          {user.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{
          fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
        }}>
          {user.email}
        </Typography>
      </Box>
      <Chip
        label={user.role.replace(/_/g, " ")}
        color={roleColor}
        size="small"
        variant="outlined"
        sx={{ height: 20, fontSize: 10, textTransform: "capitalize" }}
      />
    </Stack>
  );
}

// ─── Proposal row ─────────────────────────────────────────────────────────────

function ProposalRow({ p }: { p: any }) {
  const statusColor: any = p.status === "active"   ? "success"
    : p.status === "approved" ? "success"
    : p.status === "rejected" ? "error"
    : p.status === "proposal" ? "warning"
    : "default";

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      component={NextLink}
      href={`/admin/proposals/${p._id}`}
      sx={{
        px: 3, py: 1.5,
        textDecoration: "none", color: "inherit",
        "&:hover": { bgcolor: (t) => alpha(t.palette.text.primary, 0.03) },
        transition: "background-color 150ms",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{
          fontWeight: 500, lineHeight: 1.3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {p.title}
        </Typography>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            by {p.createdBy?.name ?? "Unknown"}
          </Typography>
          {p.upvotes > 0 && (
            <>
              <Typography variant="caption" color="text.secondary">·</Typography>
              <Stack direction="row" alignItems="center" gap={0.25}>
                <UpvoteIcon sx={{ fontSize: 11, color: "success.main" }} />
                <Typography variant="caption" sx={{ fontSize: 11, color: "success.main", fontWeight: 500 }}>
                  {p.upvotes}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
      <Chip
        label={p.status}
        color={statusColor}
        size="small"
        sx={{ height: 20, fontSize: 10, textTransform: "capitalize" }}
      />
    </Stack>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardClient({ stats }: { stats: Stats }) {
  return (
    <Stack gap={3}>
      {/* Stat cards */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        gap: 2,
      }}>
        <BigStat
          label="Users"
          value={stats.totalUsers}
          sub={`${stats.adminCount} admins`}
          icon={<UsersIcon />}
          color="primary"
          href="/admin/users"
        />
        <BigStat
          label="Proposals"
          value={stats.totalProposals}
          sub={`${stats.activeProposals} active`}
          icon={<DocIcon />}
          color="info"
          href="/admin/proposals"
        />
        <BigStat
          label="Projects"
          value={stats.totalProjects}
          sub={`${stats.activeProjects} active`}
          icon={<FolderIcon />}
          color="success"
          href="/admin/projects"
        />
        <BigStat
          label="Tasks"
          value={stats.totalTasks}
          sub={`${stats.completedTasks} completed`}
          icon={<TaskIcon />}
          color="warning"
        />
      </Box>

      {/* KPI bar */}
      <KpiBar stats={stats} />

      {/* Recent lists */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", xl: "repeat(2, 1fr)" },
        gap: 3,
      }}>
        <ListCard
          title="Recent Users"
          viewAllHref="/admin/users"
          items={stats.recentUsers.length > 0
            ? stats.recentUsers.map((u) => <UserRow key={u._id} user={u} />)
            : <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">No users yet.</Typography>
              </Box>}
        />

        <ListCard
          title="Recent Proposals"
          viewAllHref="/admin/proposals"
          items={stats.recentProposals.length > 0
            ? stats.recentProposals.map((p) => <ProposalRow key={p._id} p={p} />)
            : <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">No proposals yet.</Typography>
              </Box>}
        />
      </Box>
    </Stack>
  );
}
