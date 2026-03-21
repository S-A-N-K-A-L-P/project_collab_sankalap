import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ id: string }>;
};

function isImageFile(url: string): boolean {
    return /\.(png|jpg|jpeg)$/i.test(url);
}

function getFileName(url: string): string {
    const raw = url.split("/").pop() || "attachment";
    return decodeURIComponent(raw);
}

export default async function IdeaDetailPage({ params }: Props) {
    const { id } = await params;

    await dbConnect();

    const proposal = await Proposal.findById(id)
        .populate("createdBy", "name role")
        .lean();

    if (!proposal) {
        notFound();
    }

    const media = Array.isArray((proposal as any).media) ? ((proposal as any).media as string[]) : [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-[#e5e7eb]">Proposal Details</h1>
                <Link href="/ideas" className="text-sm text-[#9ca3af] hover:text-[#e5e7eb] transition-colors">
                    Back to My Ideas
                </Link>
            </div>

            <article className="rounded-2xl border border-[#1f1f23] bg-[#121214] p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9ca3af]">{(proposal as any).type || "idea"}</p>
                    <h2 className="text-2xl font-bold text-[#e5e7eb] tracking-tight">{(proposal as any).title}</h2>
                    <p className="text-sm text-[#9ca3af]">
                        Created by {(proposal as any).createdBy?.name || "Unknown"}
                    </p>
                </div>

                <p className="text-sm leading-relaxed text-[#d1d5db]">{(proposal as any).description}</p>

                {Array.isArray((proposal as any).techStack) && (proposal as any).techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {((proposal as any).techStack as string[]).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md border border-[#2a2a2f] bg-[#0f0f11] px-2.5 py-1 text-[11px] font-semibold text-[#9ca3af]"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}

                <section className="space-y-3 pt-2 border-t border-[#1f1f23]">
                    <h3 className="text-sm font-semibold text-[#e5e7eb]">Attachments</h3>

                    {media.length === 0 ? (
                        <p className="text-sm text-[#9ca3af]">No files attached to this proposal.</p>
                    ) : (
                        <div className="space-y-4">
                            {media.map((url) => (
                                <div key={url} className="rounded-xl border border-[#2a2a2f] bg-[#0f0f11] p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-[#d1d5db] truncate">{getFileName(url)}</p>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-[#6366f1] hover:text-[#818cf8]"
                                            download
                                        >
                                            Download
                                        </a>
                                    </div>

                                    {isImageFile(url) ? (
                                        <img src={url} alt={getFileName(url)} className="max-h-96 w-full rounded-lg object-contain bg-[#121214]" />
                                    ) : (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex rounded-md border border-[#2a2a2f] px-3 py-2 text-xs font-medium text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-white/[0.03]"
                                        >
                                            Preview File
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </article>
        </div>
    );
}
