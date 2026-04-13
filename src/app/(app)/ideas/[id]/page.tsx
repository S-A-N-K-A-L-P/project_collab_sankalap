import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProposalComments from "@/components/proposal/ProposalComments";

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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Proposal Details</h1>
                <Link href="/ideas" className="text-sm text-muted hover:text-foreground transition-colors">
                    Back to My Ideas
                </Link>
            </div>

            <article className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">{(proposal as any).type || "idea"}</p>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{(proposal as any).title}</h2>
                    <p className="text-sm text-muted">
                        Created by {(proposal as any).createdBy?.name || "Unknown"}
                    </p>
                </div>

                <p className="text-sm leading-relaxed text-foreground">{(proposal as any).description}</p>

                {Array.isArray((proposal as any).techStack) && (proposal as any).techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {((proposal as any).techStack as string[]).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md border border-border-subtle bg-surface-alt px-2.5 py-1 text-[11px] font-semibold text-muted"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}

                <section className="space-y-3 pt-2 border-t border-border-subtle">
                    <h3 className="text-sm font-semibold text-foreground">Attachments</h3>

                    {media.length === 0 ? (
                        <p className="text-sm text-muted">No files attached to this proposal.</p>
                    ) : (
                        <div className="space-y-4">
                            {media.map((url) => (
                                <div key={url} className="rounded-xl border border-border-subtle bg-surface-alt p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-foreground truncate">{getFileName(url)}</p>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-accent hover:text-[#818cf8]"
                                            download
                                        >
                                            Download
                                        </a>
                                    </div>

                                    {isImageFile(url) ? (
                                        <img src={url} alt={getFileName(url)} className="max-h-96 w-full rounded-lg object-contain bg-background" />
                                    ) : (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex rounded-md border border-border-subtle px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-white/3"
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

            <div className="pt-6 border-t border-[#1f1f23]">
                <ProposalComments proposalId={id} />
            </div>
        </div>
    );
}
