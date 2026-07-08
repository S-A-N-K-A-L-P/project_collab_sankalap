import type { ReactNode } from "react";
import { OrgProvider } from "@/context/OrgContext";

interface OrgLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { slug } = await params;
  return <OrgProvider slug={slug}>{children}</OrgProvider>;
}
