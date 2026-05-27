"use client";

import { AppBar, Toolbar, Box, Stack, Avatar, Typography, Tooltip, alpha } from "@mui/material";
import {
  HomeRounded          as HomeIcon,
  LightbulbRounded     as LightbulbIcon,
  ChecklistRounded     as TasksIcon,
  EmojiEventsRounded   as ShowcaseIcon,
  ExploreRounded       as DiscoverIcon,
  NotificationsRounded as BellIcon,
  BoltRounded          as BoltIcon,
} from "@mui/icons-material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useSession }  from "next-auth/react";
import { TOP_NAV_HEIGHT } from "./constants";

const NAV = [
  { href: "/feed",          label: "Feed",          Icon: HomeIcon      },
  { href: "/ideas",         label: "Proposals",     Icon: LightbulbIcon },
  { href: "/tasks",         label: "Tasks",         Icon: TasksIcon     },
  { href: "/showcase",      label: "Showcase",      Icon: ShowcaseIcon  },
  { href: "/discover",      label: "Discover",      Icon: DiscoverIcon  },
  { href: "/notifications", label: "Notifications", Icon: BellIcon      },
];

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  const userHref = user?.id ? `/profile/${user.id}` : "/login";
  const initials  = (user?.name || "?")
    .split(" ").map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 2,
        bgcolor: "background.paper",
        color:   "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          height: TOP_NAV_HEIGHT,
          minHeight: `${TOP_NAV_HEIGHT}px !important`,
          px: { xs: 2, md: 3 },
          gap: 0,
        }}
      >
        {/* ── Brand ─────────────────────────────────── */}
        <Box
          component={NextLink}
          href="/feed"
          sx={{
            display: "flex", alignItems: "center", gap: 1.25,
            textDecoration: "none", mr: { xs: 2, md: 4 }, flexShrink: 0,
          }}
        >
          <Box sx={{
            width: 32, height: 32, borderRadius: 1,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
          }}>
            <BoltIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em",
              color: "primary.main",
              display: { xs: "none", sm: "block" },
            }}
          >
            S.A.N.K.A.L.P
          </Typography>
        </Box>

        {/* ── Nav items ─────────────────────────────── */}
        <Stack direction="row" sx={{ flex: 1 }}>
          {NAV.map(({ href, label, Icon }) => {
            const active =
              pathname === href ||
              (href !== "/feed" && pathname.startsWith(href));

            return (
              <Box
                key={href}
                component={NextLink}
                href={href}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.5,
                  px: { xs: 1.25, md: 2, lg: 2.5 },
                  height: TOP_NAV_HEIGHT,
                  pb: 1,
                  textDecoration: "none",
                  color: active ? "primary.main" : "text.secondary",
                  borderBottom: "2px solid",
                  borderColor: active ? "primary.main" : "transparent",
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
                  },
                  transition: "all 150ms",
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
                <Typography sx={{
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  lineHeight: 1,
                  display: { xs: "none", lg: "block" },
                }}>
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        {/* ── User avatar ───────────────────────────── */}
        <Tooltip title={user?.name || "Profile"} arrow>
          <Avatar
            component={NextLink}
            href={userHref}
            src={user?.image}
            sx={{
              width: 34, height: 34,
              fontSize: 12, fontWeight: 700,
              bgcolor: "primary.main",
              textDecoration: "none",
              cursor: "pointer",
              ml: 1,
              border: "2px solid transparent",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.25)}`,
              },
              transition: "all 150ms",
            }}
          >
            {initials}
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
