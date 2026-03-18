"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateProposalModal from "@/components/feed/CreateProposalModal";
import { useRouter } from "next/navigation";

export default function FeedActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
      >
        <Plus className="w-4 h-4" /> New Vision
      </button>

      {/* Floating Action Button (Lower Right) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-90 transition-all lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
