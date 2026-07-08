"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import {
  Box, Stack, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Button, alpha,
} from "@mui/material";

import DashboardRounded    from "@mui/icons-material/DashboardRounded";
import PeopleAltRounded    from "@mui/icons-material/PeopleAltRounded";
import DescriptionRounded  from "@mui/icons-material/DescriptionRounded";
import FolderRounded       from "@mui/icons-material/FolderRounded";
import ShieldRounded       from "@mui/icons-material/ShieldRounded";
import LogoutRounded       from "@mui/icons-material/LogoutRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ArrowBackRounded    from "@mui/icons-material/ArrowBackRounded";
import EmailRounded        from "@mui/icons-material/EmailRounded";
import CorporateFareRounded from "@mui/icons-material/CorporateFareRounded";
import TuneRounded         from "@mui/icons-material/TuneRounded";
import { isPlatformReviewer, isAdminRole } from "@/lib/roles";
const DashboardIcon = DashboardRounded;
const UsersIcon     = PeopleAltRounded;
const DocIcon       = DescriptionRounded;
const FolderIcon    = FolderRounded;
const ShieldIcon    = ShieldRounded;
const LogoutIcon    = LogoutRounded;
const ChevronIcon   = ChevronRightRounded;
const BackIcon      = ArrowBackRounded;
const InquiryIcon   = EmailRounded;
const OrgIcon       = CorporateFareRounded;
const ConfigIcon    = TuneRounded;

const WIDTH = 250;

const NAV = [
  { href: "/admin/dashboard",            label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/users",                label: "Users",     icon: UsersIcon     },
  { href: "/admin/proposals",            label: "Proposals", icon: DocIcon       },
  { href: "/admin/projects",             label: "Projects",  icon: FolderIcon    },
  { href: "/admin/marketplace/inquiries", label: "Inquiries", icon: InquiryIcon  },
];

/** Role-gated entries appended after the base NAV */
const GATED_NAV = [
  {
    href: "/admin/org-requests",
    label: "Org Requests",
    icon: OrgIcon,
    show: (role?: string) => isPlatformReviewer(role),
  },
  {
    href: "/admin/config",
    label: "Config",
    icon: ConfigIcon,
    // read-only for other admin roles; page enforces write gating
    show: (role?: string) => isAdminRole(role),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: WIDTH,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          backgroundImage: "none",
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 1.5,
            bgcolor: "primary.main",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.32)}`,
          }}>
            <ShieldIcon sx={{ color: "primary.contrastText", fontSize: 20 }} />
          </Box>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "text.disabled", lineHeight: 1,
            }}>
              Syncro
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
              Admin Panel
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Back to app */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Button
          component={NextLink}
          href="/feed"
          fullWidth
          size="small"
          startIcon={<BackIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none", justifyContent: "flex-start",
            color: "text.secondary", fontWeight: 500, fontSize: 12,
            "&:hover": { bgcolor: (t) => alpha(t.palette.text.primary, 0.04) },
          }}
        >
          Back to app
        </Button>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1.5, px: 1.5 }}>
        <Typography variant="caption" sx={{
          px: 1.5, mb: 0.75,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase", color: "text.disabled",
          display: "block",
        }}>
          Management
        </Typography>
        <List dense disablePadding>
          {[...NAV, ...GATED_NAV.filter((g) => g.show(user?.role))].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={NextLink}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    borderRadius: 1, py: 0.875, px: 1.25, position: "relative",
                    "&.Mui-selected": {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                      "& .MuiListItemText-primary": { color: "primary.main", fontWeight: 600 },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: -6,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        borderRadius: "0 3px 3px 0",
                        bgcolor: "primary.main",
                      },
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.20),
                    },
                    "&:hover": { bgcolor: (t) => alpha(t.palette.text.primary, 0.04) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
                    <Icon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                  />
                  {isActive && <ChevronIcon sx={{ fontSize: 16, color: "primary.main" }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* User card + signout */}
      <Box sx={{ p: 2 }}>
        {user && (
          <Box sx={{
            p: 1.5, mb: 1.25,
            bgcolor: "background.default",
            border: 1, borderColor: "divider",
            borderRadius: 1,
            display: "flex", alignItems: "center", gap: 1.25,
          }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 12, fontWeight: 700 }}>
              {(user.name || "?")[0]?.toUpperCase()}
            </Avatar>
            <Stack sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{
                fontWeight: 600, lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                fontSize: 11,
              }}>
                {user.email}
              </Typography>
              <Typography variant="caption" sx={{
                fontSize: 10, color: "primary.main", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {user.role?.replace(/_/g, " ")}
              </Typography>
            </Stack>
          </Box>
        )}

        <Button
          fullWidth
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          sx={{
            py: 0.625, fontSize: 12, fontWeight: 500, textTransform: "none",
            color: "text.secondary", borderColor: "divider",
            "&:hover": {
              bgcolor: (t) => alpha(t.palette.error.main, 0.08),
              borderColor: "error.main",
              color: "error.main",
            },
          }}
        >
          Sign out
        </Button>
      </Box>
    </Drawer>
  );
}
