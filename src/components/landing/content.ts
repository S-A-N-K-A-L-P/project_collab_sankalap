/**
 * Everything the public landing and About pages say, in one place, so copy, the intro video and the company logo
 * can be changed without touching layout code.
 */

export const BRAND = {
  name: "S.A.N.K.A.L.P.",
  expansion: "Solutions for Atmanirbhar Nation",
  company: "Morwin Technologies",
  /** Path under /public for the Morwin Technologies logo. Leave null until the logo file is added. */
  companyLogo: null as string | null,
  /** The S.A.N.K.A.L.P. mark shown in the nav and footer. */
  logo: "/syncro.jpg",
};

export type VideoConfig = {
  src: string;
  poster?: string;
  /** Timestamp (seconds) used to preview a frame before Play is clicked on local MP4 files. */
  previewTime?: number;
  title: string;
  subtitle?: string;
  length?: string;
};

/**
 * The introduction video shown in the hero.
 * - A YouTube or Vimeo link is embedded as a player.
 * - A path to a file (for example "/media/sankalp_intro.mp4" in /public) plays with the browser's own player.
 */
export const INTRO_VIDEO: VideoConfig = {
  src: process.env.NEXT_PUBLIC_INTRO_VIDEO_URL || "/media/sankalp_intro.mp4",
  poster: "",
  previewTime: 0.5,
  title: "Introducing S.A.N.K.A.L.P.",
  subtitle: `${BRAND.name} · ${BRAND.company}`,
  length: "1:20",
};

/**
 * The Syncro Git product showcase video (powered by Syncro Desktop).
 */
export const SYNCRO_GIT_VIDEO: VideoConfig = {
  src: process.env.NEXT_PUBLIC_SYNCRO_SHOWCASE_VIDEO_URL || "/media/syncro_git_showcase.mp4",
  poster: "",
  previewTime: 4,
  title: "Syncro Git — Private Git with built-in code intelligence",
  subtitle: "Powered by Syncro Desktop · A S.A.N.K.A.L.P. project",
  length: "2:10",
};

export type SyncroHighlight = {
  title: string;
  text: string;
  icon: "git" | "search" | "key" | "history";
};

export const SYNCRO_HIGHLIGHTS: SyncroHighlight[] = [
  {
    icon: "git",
    title: "Smart Syncro Push & Code Intelligence",
    text: "Every push automatically indexes files, symbols, API routes and dependencies — giving an instant map of the repository without a separate pipeline.",
  },
  {
    icon: "search",
    title: "Low-token RAG & Vector Search",
    text: "Search and ask questions by meaning, not just keyword. Agents receive only the relevant slices instead of thousands of lines of private code.",
  },
  {
    icon: "key",
    title: "Works with or without AI",
    text: "Get retrieval-only code answers with no model running, bring a free Groq key, or run local models through Ollama while keeping token usage minimal.",
  },
  {
    icon: "history",
    title: "Hindsight project memory",
    text: "Preserves past context alongside the repository so contributors understand why the code looks the way it does, not just what it does.",
  },
];

export const NAV_LINKS = [
  { label: "About us", href: "/about" },
  { label: "What we build", href: "/#focus" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Syncro Git", href: "/#syncro-git" },
  { label: "Projects", href: "/#projects" },
];

export type FocusArea = {
  division: string;
  title: string;
  summary: string;
  points: string[];
  icon: "sprout" | "heart" | "truck";
};

export const FOCUS_AREAS: FocusArea[] = [
  {
    division: "R&D Division",
    title: "Agriculture",
    icon: "sprout",
    summary: "Field sensors, connected equipment and AI models that help farmers decide what to do, and when.",
    points: ["Soil, water and weather sensing", "Crop health from images", "Advisory tools that work on low bandwidth"],
  },
  {
    division: "R&D Division",
    title: "Healthcare",
    icon: "heart",
    summary: "Connected devices and AI-assisted tools that bring reliable care closer to clinics and homes.",
    points: ["Remote patient monitoring", "Screening and triage support", "Secure health-data pipelines"],
  },
  {
    division: "Cloud Division",
    title: "Logistics",
    icon: "truck",
    summary: "Cloud platforms that track, plan and connect goods movement, so more of India runs on digital rails.",
    points: ["Fleet and shipment tracking", "Route and load planning", "Integrations for small operators"],
  },
];

export const PILLARS = [
  { title: "Cloud", text: "Scalable platforms and data pipelines that connect people, devices and services." },
  { title: "Artificial intelligence", text: "Applied models that turn field and sensor data into decisions." },
  { title: "Internet of Things", text: "Hardware and firmware that measure the real world, where it happens." },
];

export const STEPS = [
  { title: "A project is proposed", text: "A Project Master defines the problem, the scope and the first working version (MVP) to build." },
  { title: "Engineers join by skill", text: "Members apply for modules that match their skills; the team is chosen by review and community vote." },
  { title: "Modules are built", text: "Work is split into modules with clear owners and a 2–7 day window, then submitted for review." },
  { title: "Reviewed and integrated", text: "Project Masters and R&D Associates review quality and architecture, then integrate the release." },
];

export const ROLES = [
  { title: "Project Master", text: "Defines projects, breaks them into modules and integrates the result." },
  { title: "R&D Associate", text: "Validates feasibility and reviews quality and architecture." },
  { title: "Contributor", text: "Builds modules, ships working versions and learns on real problems." },
  { title: "Observer", text: "Follows projects, assists teams and grows into a contributor." },
];

export const TEAM = [
  { name: "Tushar Yadav", role: "Senior Architect" },
  { name: "Jaspreet Singh", role: "System Architect" },
  { name: "Anish Sharma", role: "Platform Architect" },
  { name: "Deepinder Singh", role: "Integration Architect" },
  { name: "Arnav Sood", role: "Product Architect" },
];

export const COMMUNITY = [
  "Raghav Arora", "Shivam Goyal", "Ayush Patial", "Satyam Narayan", "Saksham Sharma", "Akagarta Arora",
];
