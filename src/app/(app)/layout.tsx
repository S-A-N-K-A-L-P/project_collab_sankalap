import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";

export const metadata: Metadata = {
  title: "Feed | Pixel Platform",
  description: "Next-gen builder coordination network.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0b0b0c] text-[#e5e7eb] font-sans antialiased">
      {/* Left Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex justify-center">
        <div className="w-full max-w-4xl p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>

      {/* Right Intelligence Panel - Sticky */}
      <RightPanel />
    </div>
  );
}
