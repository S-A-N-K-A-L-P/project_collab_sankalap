"use client";

import { Box } from "@mui/material";
import TopNav     from "./TopNav";
import Sidebar    from "./Sidebar";
import RightPanel from "./RightPanel";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from "./constants";

export default function AppLayoutClient({ children, wide = false, hideRightPanel = false }: { children: React.ReactNode; wide?: boolean; hideRightPanel?: boolean }) {
  const { isRightPanelCollapsed, isSidebarCollapsed } = useLayout();
  const sidebarWidth = isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage: (t) =>
          t.palette.mode === "light"
            ? "radial-gradient(ellipse 75% 32% at 50% 0%, rgba(238, 236, 255, 0.75) 0%, rgba(154, 138, 239, 0.08) 48%, transparent 100%)"
            : "radial-gradient(ellipse 75% 32% at 50% 0%, rgba(98, 87, 232, 0.14) 0%, transparent 100%)",
        backgroundAttachment: "fixed",
      }}
    >

      {/* ── Fixed top navigation ───────────────────────────── */}
      <TopNav />

      {/* ── Below the nav bar ─────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          pt: `${TOP_NAV_HEIGHT}px`,
        }}
      >
        {/* Spacer that mirrors the fixed sidebar's width */}
        <Box
          sx={{
            width: { xs: 0, sm: sidebarWidth },
            flexShrink: 0,
            transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Fixed sidebar rail */}
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
              maxWidth: wide ? "1440px" : (isRightPanelCollapsed ? "1280px" : "920px"),
              p: wide ? { xs: 2, md: 3, xl: 4 } : { xs: 2.5, sm: 3, lg: 4 },
              transition: "max-width 240ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {children}
          </Box>
        </Box>

        {/* ── Collapsible right panel ─────────────────────── */}
        <Box
          sx={{
            width: hideRightPanel || isRightPanelCollapsed ? 0 : 312,
            opacity: hideRightPanel || isRightPanelCollapsed ? 0 : 1,
            overflow: "hidden",
            pointerEvents: hideRightPanel || isRightPanelCollapsed ? "none" : "auto",
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
