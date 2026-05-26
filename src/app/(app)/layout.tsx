import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

export const metadata: Metadata = {
  title: "Feed | Syncro",
  description: "SANKALP builder coordination network.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();

  return (
    <AppLayoutClient>
      {children}
    </AppLayoutClient>
  );
}
