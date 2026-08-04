import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgPortfolio from "@/models/OrgPortfolio";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const org = await Org.findOne({ slug, status: "active" }).select("name tagline description logo bannerImage").lean() as any;
  if (!org) return { title: "Organization portfolio" };
  const portfolio = await OrgPortfolio.findOne({ orgId: org._id, isPublished: true }).select("published seo").lean() as any;
  const published = portfolio?.published || {};
  const title = published?.seo?.title || portfolio?.seo?.title || `${org.name} — Organization`;
  const description = published?.seo?.description || portfolio?.seo?.description || org.tagline || org.description;
  const image = org.bannerImage || org.logo;
  return {
    title,
    description,
    alternates: { canonical: `/orgs/${slug}/portfolio` },
    openGraph: { title, description, type: "website", images: image ? [{ url: image }] : undefined },
  };
}

export default function OrgPortfolioLayout({ children }: { children: React.ReactNode }) { return children; }
