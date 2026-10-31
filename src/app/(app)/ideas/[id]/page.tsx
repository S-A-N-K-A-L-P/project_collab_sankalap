import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProposalComments from "@/components/proposal/ProposalComments";
import { ArrowLeft, Paperclip, Download, ExternalLink } from "lucide-react";

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
    const status = String((proposal as any).status || "proposal");

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/ideas"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Proposals
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Proposal Details</h1>
                </div>
                <span className="pill-primary text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {status}
                </span>
            </div>

            <article className="saas-card p-6 space-y-5">
                <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="pill-info text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {(proposal as any).type || "idea"}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">{(proposal as any).title}</h2>
                    <p className="text-xs text-muted">
                        Submitted by <span className="font-semibold text-foreground">{(proposal as any).createdBy?.name || "Unknown"}</span>
                    </p>
                </div>

                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{(proposal as any).description}</p>

                {Array.isArray((proposal as any).techStack) && (proposal as any).techStack.length > 0 ? (
                    <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Technologies</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {((proposal as any).techStack as string[]).map((tag) => (
                                <span
                                    key={tag}
                                    className="pill-info rounded-full px-3 py-1 text-xs font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}

                <section className="space-y-3 pt-4 border-t border-border">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-primary" /> Attachments
                    </h3>

                    {media.length === 0 ? (
                        <p className="text-xs text-muted">No files attached to this proposal.</p>
                    ) : (
                        <div className="space-y-3">
                            {media.map((url) => (
                                <div key={url} className="rounded-xl border border-border bg-background/60 p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium text-foreground truncate">{getFileName(url)}</p>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
                                            download
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download
                                        </a>
                                    </div>

                                    {isImageFile(url) ? (
                                        <img src={url} alt={getFileName(url)} className="max-h-96 w-full rounded-xl object-contain bg-card border border-border" />
                                    ) : (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-primary" /> Preview File
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </article>

            <div className="saas-card p-6">
                <ProposalComments proposalId={id} />
            </div>
        </div>
    );
}
