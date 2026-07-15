"use client";

import { useEffect, useRef, useState } from "react";
import {
  AppBar, Toolbar, Box, Stack, Avatar, Typography, Tooltip,
  InputBase, ClickAwayListener, alpha,
} from "@mui/material";
import SearchRounded        from "@mui/icons-material/SearchRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import FlashOn               from "@mui/icons-material/FlashOn";
import MenuRounded          from "@mui/icons-material/MenuRounded";
import HomeRounded          from "@mui/icons-material/HomeRounded";
import DescriptionRounded   from "@mui/icons-material/DescriptionRounded";
import ChecklistRounded     from "@mui/icons-material/ChecklistRounded";
import CorporateFareRounded from "@mui/icons-material/CorporateFareRounded";
import GridViewRounded      from "@mui/icons-material/GridViewRounded";
import ExploreRounded       from "@mui/icons-material/ExploreRounded";
const BellIcon      = NotificationsRounded;
const BoltIcon      = FlashOn;   // BoltRounded has no individual file in @mui/icons-material@6
const SearchIcon    = SearchRounded;
const MenuIcon      = MenuRounded;
const FeedIcon      = HomeRounded;
const ProposalsIcon = DescriptionRounded;
const TasksIcon     = ChecklistRounded;
const OrgsIcon      = CorporateFareRounded;
const ShowcaseIcon  = GridViewRounded;
const DiscoverIcon  = ExploreRounded;
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession }  from "next-auth/react";
import { useLayout } from "@/context/LayoutContext";
import { TOP_NAV_HEIGHT } from "./constants";

const NAV = [
  { href: "/feed",          label: "Feed",          Icon: FeedIcon      },
  { href: "/ideas",         label: "Proposals",     Icon: ProposalsIcon },
  { href: "/tasks",         label: "Tasks",         Icon: TasksIcon     },
  { href: "/orgs",          label: "Orgs",          Icon: OrgsIcon      },
  { href: "/showcase",      label: "Showcase",      Icon: ShowcaseIcon  },
  { href: "/discover",      label: "Discover",      Icon: DiscoverIcon  },
  { href: "/notifications", label: "Notifications", Icon: BellIcon      },
];

function roleLabel(role?: string) {
  if (!role) return "Member";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SearchResult {
  _id: string;
  name: string;
  avatar?: string;
  role?: string;
  universityName?: string;
}

/* ── Search box: live people-search dropdown ─────────── */
function NavSearch() {
  const router = useRouter();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/developers/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setResults(Array.isArray(data) ? data.slice(0, 6) : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/profile/${id}`);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", width: "100%", maxWidth: 380, display: { xs: "none", md: "block" } }}>
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            height: 38, borderRadius: 2.5, px: 1.5,
            bgcolor: "action.hover",
            border: "1px solid transparent",
            "&:focus-within": { borderColor: "primary.main", bgcolor: "background.paper" },
            transition: "all 150ms",
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
              if (e.key === "Enter" && results[0]) handleSelect(results[0]._id);
            }}
            placeholder="Search proposals, modules, or users..."
            sx={{ fontSize: 13.5, flex: 1, "& input": { p: 0 } }}
          />
        </Box>

        {open && (loading || results.length > 0) && (
          <Box
            sx={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
              borderRadius: 2, boxShadow: 4, zIndex: (t) => t.zIndex.drawer + 3,
              maxHeight: 320, overflowY: "auto", py: 0.5,
            }}
          >
            {loading && (
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", px: 2, py: 1 }}>
                Searching…
              </Typography>
            )}
            {!loading && results.map((r) => (
              <Box
                key={r._id}
                onClick={() => handleSelect(r._id)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.25,
                  px: 1.5, py: 1, cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Avatar src={r.avatar} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: "primary.main" }}>
                  {(r.name || "?")[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }} noWrap>
                    {r.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.3 }} noWrap>
                    {roleLabel(r.role)}{r.universityName ? ` · ${r.universityName}` : ""}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toggleMobileSidebarOpen } = useLayout();
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
          px: { xs: 1.5, sm: 2, md: 3 },
          gap: { xs: 1, sm: 1.5, md: 2.5 },
        }}
      >
        {/* ── Mobile sidebar toggle ─────────────────── */}
        <Box
          onClick={toggleMobileSidebarOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMobileSidebarOpen(); }
          }}
          sx={{
            display: { xs: "flex", sm: "none" },
            width: 36, height: 36, borderRadius: 1.5,
            alignItems: "center", justifyContent: "center",
            color: "text.secondary", flexShrink: 0, cursor: "pointer",
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          <MenuIcon sx={{ fontSize: 22 }} />
        </Box>

        {/* ── Brand ─────────────────────────────────── */}
        <Box
          component={NextLink}
          href="/feed"
          sx={{
            display: "flex", alignItems: "center", gap: 1.25,
            textDecoration: "none", flexShrink: 0,
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

        {/* ── Nav tabs ──────────────────────────────── */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            flex: 1,
            minWidth: 0,
            justifyContent: "center",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {NAV.map(({ href, label, Icon }) => {
            const active =
              pathname === href ||
              (href !== "/feed" && pathname?.startsWith(href));

            return (
              <Box
                key={href}
                component={NextLink}
                href={href}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.25,
                  height: 44,
                  px: 1.5,
                  borderRadius: 1.5,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  textDecoration: "none",
                  color: active ? "primary.main" : "text.secondary",
                  bgcolor: active ? alpha("#6366f1", 0.1) : "transparent",
                  "&:hover": {
                    bgcolor: active ? alpha("#6366f1", 0.14) : (t) => alpha(t.palette.text.primary, 0.04),
                    color: active ? "primary.main" : "text.primary",
                  },
                  transition: "all 150ms",
                }}
              >
                <Icon sx={{ fontSize: 21 }} />
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        {/* ── Search ────────────────────────────────── */}
        <NavSearch />

        {/* ── User ──────────────────────────────────── */}
        <Box
          component={NextLink}
          href={userHref}
          sx={{
            display: "flex",
            alignItems: "center", gap: 1.25,
            textDecoration: "none", flexShrink: 0,
          }}
        >
          <Box sx={{ textAlign: "right", display: { xs: "none", lg: "block" } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", lineHeight: 1.25 }} noWrap>
              {user?.name || "Guest"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.25 }} noWrap>
              {roleLabel(user?.role)}
            </Typography>
          </Box>

          <Tooltip title={user?.name || "Profile"} arrow>
            <Box sx={{ position: "relative", display: "flex" }}>
              <Avatar
                src={user?.image}
                sx={{
                  width: 34, height: 34,
                  fontSize: 12, fontWeight: 700,
                  bgcolor: "primary.main",
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
              <Box
                sx={{
                  position: "absolute", right: -1, bottom: -1,
                  width: 10, height: 10, borderRadius: "50%",
                  bgcolor: "#22c55e",
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            </Box>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
