"use client";

import { usePathname } from "next/navigation";
import { AppBar, Toolbar, Box, IconButton, Typography, Badge, alpha } from "@mui/material";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import HelpOutlineRounded    from "@mui/icons-material/HelpOutlineRounded";
const BellIcon = NotificationsRounded;
const HelpIcon = HelpOutlineRounded;

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users":     "User Management",
  "/admin/proposals": "Proposals",
  "/admin/projects":  "Projects",
};

const dynamicTitles: [string, string][] = [
  ["/admin/users/",     "User Profile"],
  ["/admin/proposals/", "Proposal Detail"],
  ["/admin/projects/",  "Project Detail"],
];

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [prefix, label] of dynamicTitles) {
    if (pathname.startsWith(prefix)) return label;
  }
  return "Admin";
}

export default function AdminHeader() {
  const pathname = usePathname();
  const title    = getTitle(pathname);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: (t) => alpha(t.palette.background.paper, 0.85),
        backdropFilter: "blur(12px)",
        borderBottom: 1,
        borderColor: "divider",
        color: "text.primary",
        backgroundImage: "none",
      }}
    >
      <Toolbar sx={{ px: { xs: 3, lg: 4 }, py: 1.5, minHeight: { xs: 64, sm: 72 } }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "text.disabled",
            display: "block",
          }}>
            Admin / {title}
          </Typography>
          <Typography variant="h6" sx={{
            fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, mt: 0.25,
          }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <HelpIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Badge color="error" variant="dot" overlap="circular">
              <BellIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
