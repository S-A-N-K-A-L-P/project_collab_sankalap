import { cache } from "react";
import mongoose from "mongoose";
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Project from "@/models/Project";
import User from "@/models/User";
import PortfolioRenderer, { type PortfolioData } from "@/components/portfolio/PortfolioRenderer";
import { getTheme } from "@/components/portfolio/themes/registry";

export const dynamic = "force-dynamic";

const load = cache(async (handle: string): Promise<PortfolioData | null> => {
  await dbConnect();

  let user: any = await User.findOne({ handle: handle.toLowerCase() })
    .select("name avatar bio location skills github techStackPreference handle").lean();
  if (!user && mongoose.isValidObjectId(handle)) {
    user = await User.findById(handle)
      .select("name avatar bio location skills github techStackPreference handle").lean();
  }
  if (!user) return null;

  const pf: any = await Portfolio.findOne({ userId: user._id }).lean();
  if (!pf || pf.isPublished === false) return null;

  const featuredIds = pf.featuredProjectIds || [];
  let projects: any[] = [];
  if (featuredIds.length) {
    const found = await Project.find({ _id: { $in: featuredIds } })
      .select("title description coverImage liveUrl githubRepo techStack version status").lean();
    const byId = new Map(found.map((p: any) => [p._id.toString(), p]));
    projects = featuredIds.map((id: any) => byId.get(id.toString())).filter(Boolean);
  } else {
    projects = await Project.find({ $or: [{ lead: user._id }, { members: user._id }], status: "completed" })
      .select("title description coverImage liveUrl githubRepo techStack version status")
      .sort({ completedAt: -1 }).limit(6).lean();
  }

  Portfolio.updateOne({ _id: pf._id }, { $inc: { views: 1 } }).catch(() => null);

  return JSON.parse(JSON.stringify({ ...pf, user, projects }));
});

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const data = await load(handle);
  if (!data) return { title: "Portfolio not found", robots: { index: false } };

  const name = data.user?.name || "Portfolio";
  const desc = data.headline || data.user?.bio || `${name}'s portfolio on S.A.N.K.A.L.P.`;
  const title = data.seo?.title || `${name} — Portfolio`;

  return {
    title,
    description: desc,
    robots: { index: true, follow: true },
    openGraph: { title, description: desc, type: "profile" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await load(handle);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1020", color: "#e2e8f0", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Portfolio not available</h1>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>This portfolio doesn&apos;t exist or isn&apos;t public yet.</p>
        <a href="/" style={{ color: "#7c5cff", fontSize: 14, marginTop: 8 }}>← Back to S.A.N.K.A.L.P.</a>
      </div>
    );
  }

  const theme = getTheme(data.themeId);

  return (
    <main style={{ minHeight: "100vh", background: theme.palette.bg }}>
      <PortfolioRenderer data={data} />
    </main>
  );
}
