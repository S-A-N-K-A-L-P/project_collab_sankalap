import { redirect } from "next/navigation";
import OrgPortfolioBuilder from "@/components/portfolio/OrgPortfolioBuilder";

interface OrgAdminPortfolioPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgAdminPortfolioPage({ params }: OrgAdminPortfolioPageProps) {
  const { slug } = await params;
  return <OrgPortfolioBuilder slug={slug} />;
}
