"use client";

import { useEffect, useState } from "react";
import { Box, Avatar, Tooltip, Divider, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import {
  Trophy,
  ShoppingBag,
  Briefcase,
  Building2,
  CalendarRange,
  Monitor,
  Settings as SettingsIcon,
  ShieldCheck,
  ClipboardList,
  Moon,
  Sun,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_MOBILE_WIDTH } from "./constants";

/* ── Sidebar palette — CSS vars from globals.css ── */
const D = {
  bg:            "var(--sidebar-bg)",
  border:        "var(--sidebar-border)",
  text:          "var(--sidebar-fg)",
  textActive:    "var(--sidebar-fg-hover)",
  hover:         "var(--sidebar-hover-bg)",
  primary:       "#6257E8",
  primaryFg:     "var(--sidebar-active-fg)",
  activeBg:      "var(--sidebar-active-bg)",
  activeBgHover: "var(--sidebar-active-bg-hover)",
  sectionLabel:  "var(--sidebar-section-label)",
  nameFg:        "var(--sidebar-name-fg)",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ── Tooltip that only appears in the collapsed rail ── */
function RailTooltip({
  label, show, children,
}: {
  label: string;
  show: boolean;
  children: React.ReactElement;
}) {
  return (
    <Tooltip
      title={show ? label : ""}
      placement="right"
      arrow
      enterDelay={220}
      leaveDelay={0}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "#171827",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 500,
            px: 1.25,
            py: 0.625,
            borderRadius: "8px",
            boxShadow: "0 6px 18px rgba(23, 24, 39, 0.22)",
          },
        },
        arrow: { sx: { color: "#171827" } },
      }}
    >
      {children}
    </Tooltip>
  );
}

/* ── Reusable nav row: fixed icon slot + animating label ─ */
function NavItem({
  icon: Icon, label, href, onClick, active, collapsed, reducedMotion,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  collapsed: boolean;
  reducedMotion: boolean;
}) {
  const labelTransition = reducedMotion
    ? "none"
    : "opacity 130ms ease, max-width 130ms ease";

  const row = (
    <Box
      onClick={onClick}
      role={onClick && !href ? "button" : undefined}
      tabIndex={onClick && !href ? 0 : undefined}
      onKeyDown={
        onClick && !href
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1.35,
        justifyContent: collapsed ? "center" : "flex-start",
        height: 40,
        px: 1.25,
        mx: 1.25,
        borderRadius: "11px",
        cursor: "pointer",
        textDecoration: "none",
        color: active ? D.primaryFg : D.text,
        bgcolor: active ? D.activeBg : "transparent",
        "&:hover": {
          bgcolor: active ? D.activeBgHover : D.hover,
          color: active ? D.primaryFg : D.textActive,
        },
        "&:focus-visible": {
          outline: `2px solid ${D.primary}`,
          outlineOffset: -2,
        },
        transition: reducedMotion ? "none" : "background-color 150ms ease, color 150ms ease",
      }}
    >
      {active && (
        <Box
          sx={{
            position: "absolute",
            left: -4,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 18,
            borderRadius: "999px",
            bgcolor: D.primary,
          }}
        />
      )}
      <Box sx={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} strokeWidth={active ? 2.1 : 1.75} />
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          opacity: collapsed ? 0 : 1,
          maxWidth: collapsed ? 0 : 165,
          transition: labelTransition,
        }}
      >
        {label}
      </Box>
    </Box>
  );

  const content = href ? (
    <Box component={NextLink} href={href} sx={{ textDecoration: "none", display: "block" }}>
      {row}
    </Box>
  ) : row;

  return (
    <RailTooltip label={label} show={collapsed}>
      {content}
    </RailTooltip>
  );
}

/* ── Main component ───────────────────────────────── */
export default function Sidebar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const {
    isSidebarCollapsed, toggleSidebarCollapsed,
    isMobileSidebarOpen, closeMobileSidebar,
  } = useLayout();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    closeMobileSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const user       = session?.user as any;
  const userHref   = user?.id ? `/profile/${user.id}` : "/login";
  const initials   = (user?.name || "?")
    .split(" ").map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const isAdmin    = user?.role === "sankalp_associate" || user?.role === "master_admin";
  const isReviewer = user?.role === "platform_moderator" || user?.role === "master_admin";
  const showAdminSection = isAdmin || isReviewer;

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const collapsed = isMobile ? false : isSidebarCollapsed;
  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const labelTransition = reducedMotion
    ? "none"
    : "opacity 130ms ease, max-width 130ms ease";

  return (
    <>
      {/* Backdrop — mobile drawer only */}
      <Box
        onClick={closeMobileSidebar}
        sx={{
          display: isMobileSidebarOpen ? { xs: "block", sm: "none" } : "none",
          position: "fixed",
          top: TOP_NAV_HEIGHT,
          left: 0, right: 0, bottom: 0,
          bgcolor: "rgba(23, 24, 39, 0.38)",
          backdropFilter: "blur(2px)",
          zIndex: (t) => t.zIndex.drawer,
        }}
      />

      <Box
        style={{
          width: isMobile ? SIDEBAR_MOBILE_WIDTH : desktopWidth,
          maxWidth: isMobile ? "82vw" : "none",
          transform: isMobile
            ? (isMobileSidebarOpen ? "translateX(0px)" : `translateX(-${SIDEBAR_MOBILE_WIDTH}px)`)
            : "none",
          transition: reducedMotion
            ? "none"
            : isMobile
              ? "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)"
              : "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        sx={{
          position: "fixed",
          top: TOP_NAV_HEIGHT,
          left: 0,
          bottom: 0,
          bgcolor: D.bg,
          borderRight: `1px solid ${D.border}`,
          display: "flex",
          flexDirection: "column",
          py: 2,
          gap: 0.4,
          overflowX: "hidden",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        {/* User avatar → profile */}
        <RailTooltip label={user?.name || "My Profile"} show={collapsed}>
          <Box
            component={NextLink}
            href={userHref}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              justifyContent: collapsed ? "center" : "flex-start",
              px: 1.25,
              py: 0.75,
              mx: 1.25,
              mb: 0.5,
              borderRadius: "12px",
              textDecoration: "none",
              "&:hover": { bgcolor: D.hover },
              transition: "background-color 150ms ease",
            }}
          >
            <Avatar
              src={user?.image}
              sx={{
                width: 32, height: 32, fontSize: 12, fontWeight: 700,
                bgcolor: D.primary, flexShrink: 0,
                boxShadow: "0 2px 6px rgba(98, 87, 232, 0.25)",
              }}
            >
              {initials}
            </Avatar>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 160,
                transition: labelTransition,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: 13, fontWeight: 600, color: D.nameFg,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  lineHeight: 1.25,
                }}
              >
                {user?.name || "My Profile"}
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: 11, color: D.text,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                View workspace profile
              </Box>
            </Box>
          </Box>
        </RailTooltip>

        <Divider sx={{ borderColor: D.border, my: 0.75, mx: 1.5 }} />

        {/* Primary navigation */}
        <NavItem icon={Trophy}        label="My Completed Projects" href="/my-completed" active={isActive("/my-completed")} collapsed={collapsed} reducedMotion={reducedMotion} />
        <NavItem icon={ShoppingBag}   label="Marketplace"           href="/marketplace"  active={isActive("/marketplace")}  collapsed={collapsed} reducedMotion={reducedMotion} />
        <NavItem icon={Briefcase}     label="My Portfolio"          href="/my-portfolio" active={isActive("/my-portfolio")} collapsed={collapsed} reducedMotion={reducedMotion} />
        <NavItem icon={Building2}     label="Organizations"         href="/orgs"         active={isActive("/orgs")}         collapsed={collapsed} reducedMotion={reducedMotion} />
        <NavItem icon={CalendarRange} label="Development Seasons"   href="/seasons"      active={isActive("/seasons")}      collapsed={collapsed} reducedMotion={reducedMotion} />
        <NavItem icon={Monitor}       label="Syncro Desktop App"    href="/desktop"      active={isActive("/desktop")}      collapsed={collapsed} reducedMotion={reducedMotion} />
        <NavItem icon={SettingsIcon}  label="Settings"              href="/settings"     active={isActive("/settings")}     collapsed={collapsed} reducedMotion={reducedMotion} />

        {/* Admin section (gated) */}
        {showAdminSection && (
          <>
            <Box
              sx={{
                mt: 1.25, mb: 0.25, mx: 1.25, px: 1.25,
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em",
                color: D.sectionLabel, textTransform: "uppercase",
                whiteSpace: "nowrap", overflow: "hidden",
                opacity: collapsed ? 0 : 1,
                maxHeight: collapsed ? 0 : 20,
                transition: labelTransition,
              }}
            >
              Administration
            </Box>
            {isAdmin && (
              <NavItem icon={ShieldCheck}   label="Admin Panel"        href="/admin/dashboard"    active={isActive("/admin/dashboard")}    collapsed={collapsed} reducedMotion={reducedMotion} />
            )}
            {isReviewer && (
              <NavItem icon={ClipboardList} label="Org Requests Queue" href="/admin/org-requests" active={isActive("/admin/org-requests")} collapsed={collapsed} reducedMotion={reducedMotion} />
            )}
          </>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        <Divider sx={{ borderColor: D.border, my: 0.75, mx: 1.5 }} />

        {/* Collapse / expand toggle — desktop/tablet only */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <NavItem
            icon={isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose}
            label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebarCollapsed}
            collapsed={collapsed}
            reducedMotion={reducedMotion}
          />
        </Box>

        {/* Theme toggle */}
        {mounted && (
          <NavItem
            icon={theme === "dark" ? Sun : Moon}
            label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            collapsed={collapsed}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Sign out */}
        <NavItem
          icon={LogOut}
          label="Sign out"
          onClick={() => signOut({ callbackUrl: "/login" })}
          collapsed={collapsed}
          reducedMotion={reducedMotion}
        />
      </Box>
    </>
  );
}
