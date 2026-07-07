"use client";

import { Box, Avatar, Tooltip, Divider } from "@mui/material";
import SettingsRounded           from "@mui/icons-material/SettingsRounded";
import LogoutRounded             from "@mui/icons-material/LogoutRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import DarkModeRounded           from "@mui/icons-material/DarkModeRounded";
import LightModeRounded          from "@mui/icons-material/LightModeRounded";
import EmojiEventsRounded        from "@mui/icons-material/EmojiEventsRounded";
import StorefrontRounded         from "@mui/icons-material/StorefrontRounded";
import PermMediaRounded          from "@mui/icons-material/PermMediaRounded";
const SettingsIcon    = SettingsRounded;
const LogoutIcon      = LogoutRounded;
const AdminIcon       = AdminPanelSettingsRounded;
const DarkIcon        = DarkModeRounded;
const LightIcon       = LightModeRounded;
const TrophyIcon      = EmojiEventsRounded;
const ShopIcon        = StorefrontRounded;
const PortfolioIcon   = PermMediaRounded;
import NextLink   from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme }  from "next-themes";
import { useEffect, useState } from "react";
import { TOP_NAV_HEIGHT, ICON_RAIL_WIDTH } from "./constants";

/* ── Always-dark palette (never follows app theme) ─── */
const D = {
  bg:      "#111827",
  border:  "rgba(255,255,255,0.07)",
  text:    "#9ca3af",
  hover:   "#1f2937",
  primary: "#6366f1",
};

/* ── Reusable icon button ─────────────────────────── */
function RailBtn({
  title, children, onClick, href,
}: {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <Tooltip title={title} placement="right" arrow>
      <Box
        onClick={onClick}
        sx={{
          width: 40, height: 40, borderRadius: 1.5,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: D.text, cursor: "pointer",
          "&:hover": { bgcolor: D.hover, color: "#e5e7eb" },
          transition: "all 150ms",
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
  if (href)
    return (
      <Box component={NextLink} href={href} sx={{ textDecoration: "none", display: "flex" }}>
        {inner}
      </Box>
    );
  return inner;
}

/* ── Main component ───────────────────────────────── */
export default function Sidebar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user      = session?.user as any;
  const userHref  = user?.id ? `/profile/${user.id}` : "/login";
  const initials  = (user?.name || "?")
    .split(" ").map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const isAdmin   = user?.role === "sankalp_associate" || user?.role === "master_admin";

  return (
    <Box
      sx={{
        position: "fixed",
        top: TOP_NAV_HEIGHT,
        left: 0,
        bottom: 0,
        width: ICON_RAIL_WIDTH,
        bgcolor: D.bg,
        borderRight: `1px solid ${D.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 0.5,
        zIndex: (t) => t.zIndex.drawer,
      }}
    >
      {/* User avatar → profile */}
      <Tooltip title={user?.name || "My Profile"} placement="right" arrow>
        <Avatar
          component={NextLink}
          href={userHref}
          src={user?.image}
          sx={{
            width: 36, height: 36, fontSize: 12, fontWeight: 700,
            bgcolor: D.primary, cursor: "pointer", textDecoration: "none",
            border: "2px solid transparent",
            "&:hover": { borderColor: D.primary, filter: "brightness(1.15)" },
            transition: "all 150ms",
            mb: 1,
          }}
        >
          {initials}
        </Avatar>
      </Tooltip>

      <Divider sx={{ width: 36, borderColor: D.border, my: 0.5 }} />

      {/* My Completed */}
      <RailBtn title="My Completed Projects" href="/my-completed">
        <TrophyIcon sx={{ fontSize: 20, color: "#fbbf24" }} />
      </RailBtn>

      {/* Marketplace */}
      <RailBtn title="Marketplace" href="/marketplace">
        <ShopIcon sx={{ fontSize: 20, color: "#34d399" }} />
      </RailBtn>

      {/* My Portfolio */}
      <RailBtn title="My Portfolio" href="/my-portfolio">
        <PortfolioIcon sx={{ fontSize: 20, color: "#a78bfa" }} />
      </RailBtn>

      {/* Settings */}
      <RailBtn title="Settings" href="/settings">
        <SettingsIcon sx={{ fontSize: 20 }} />
      </RailBtn>

      {/* Admin (gated) */}
      {isAdmin && (
        <RailBtn title="Admin Panel" href="/admin/dashboard">
          <AdminIcon sx={{ fontSize: 20, color: "#fca5a5" }} />
        </RailBtn>
      )}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      <Divider sx={{ width: 36, borderColor: D.border, my: 0.5 }} />

      {/* Theme toggle */}
      {mounted && (
        <RailBtn
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark"
            ? <LightIcon sx={{ fontSize: 20 }} />
            : <DarkIcon  sx={{ fontSize: 20 }} />
          }
        </RailBtn>
      )}

      {/* Sign out */}
      <RailBtn title="Sign out" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogoutIcon sx={{ fontSize: 20 }} />
      </RailBtn>
    </Box>
  );
}
