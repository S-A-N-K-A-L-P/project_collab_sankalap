"use client";

import { Box } from "@mui/material";
import TopNav    from "./TopNav";
import Sidebar   from "./Sidebar";
import RightPanel from "./RightPanel";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from "./constants";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isRightPanelCollapsed, isSidebarCollapsed } = useLayout();
  const sidebarWidth = isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── Fixed top navigation ───────────────────────────── */}
      <TopNav />

      {/* ── Below the nav bar ─────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          pt: `${TOP_NAV_HEIGHT}px`,   /* push content below AppBar */
        }}
      >
        {/* Spacer that mirrors the fixed sidebar's width, animating in sync with it.
            Zero-width on mobile — the sidebar becomes an overlay drawer there instead
            of pushing content. */}
        <Box
          sx={{
            width: { xs: 0, sm: sidebarWidth },
            flexShrink: 0,
            transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Fixed icon rail (profile / settings / theme / sign-out) */}
        <Sidebar />

        {/* ── Main content ───────────────────────────────── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: `calc(100vh - ${TOP_NAV_HEIGHT}px)`,
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: isRightPanelCollapsed ? "1280px" : "860px",
              p: { xs: 3, lg: 4 },
              transition: "max-width 240ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {children}
          </Box>
        </Box>

        {/* ── Collapsible right panel ─────────────────────── */}
        <Box
          sx={{
            width: isRightPanelCollapsed ? 0 : 300,
            opacity: isRightPanelCollapsed ? 0 : 1,
            overflow: "hidden",
            pointerEvents: isRightPanelCollapsed ? "none" : "auto",
            transition: "width 240ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms",
            display: { xs: "none", xl: "block" },
            flexShrink: 0,
          }}
        >
          <RightPanel />
        </Box>
      </Box>
    </Box>
  );
}
