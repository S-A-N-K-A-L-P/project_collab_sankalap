"use client";

import { Box } from "@mui/material";
import AdminGuard from "./AdminGuard";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <Box sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}>
        <AdminSidebar />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AdminHeader />
          <Box component="main" sx={{
            flex: 1,
            p: { xs: 3, lg: 4 },
            maxWidth: 1400,
            width: "100%",
            mx: "auto",
          }}>
            {children}
          </Box>
        </Box>
      </Box>
    </AdminGuard>
  );
}
