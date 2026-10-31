"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EditProposalModal from "@/components/proposal/EditProposalModal";

type EditableProposal = {
  _id: string;
  title: string;
  description: string;
  type: string;
  techStack: string[];
  media: string[];
  createdById: string;
};

export default function ProposalDetailEditControls({ proposal }: { proposal: EditableProposal }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = useMemo(() => {
    const currentUserId = String((session?.user as { id?: string } | undefined)?.id || "");
    return Boolean(currentUserId && currentUserId === proposal.createdById);
  }, [proposal.createdById, session?.user]);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-[#1f1f23] bg-[#0f0f11] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:border-[#6366f1] hover:text-[#e5e7eb]"
      >
        Edit Proposal
      </button>

      {isOpen ? (
        <EditProposalModal
          proposal={{
            _id: proposal._id,
            title: proposal.title,
            description: proposal.description,
            type: proposal.type,
            techStack: proposal.techStack,
            media: proposal.media,
          }}
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
