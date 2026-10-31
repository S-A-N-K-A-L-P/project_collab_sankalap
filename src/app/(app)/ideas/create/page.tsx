'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, Lightbulb, Upload } from 'lucide-react';

type ProposalType =
    | 'idea'
    | 'research'
    | 'implementation'
    | 'collaboration'
    | 'protocol'
    | 'node'
    | 'infrastructure';

export default function CreateIdeaPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ProposalType>('idea');
    const [techStackInput, setTechStackInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);

    const techStack = useMemo(
        () =>
            techStackInput
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
        [techStackInput]
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();

        if (!cleanTitle) {
            setError('Title is required.');
            return;
        }

        if (!cleanDescription) {
            setError('Description is required.');
            return;
        }

        if (attachment) {
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/png',
                'image/jpeg',
            ];
            const maxSize = 5 * 1024 * 1024;

            if (!allowedTypes.includes(attachment.type)) {
                setError('Invalid file type. Allowed: PDF, DOCX, PNG, JPG.');
                return;
            }

            if (attachment.size > maxSize) {
                setError('File is too large. Maximum size is 5 MB.');
                return;
            }
        }

        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', cleanTitle);
            formData.append('description', cleanDescription);
            formData.append('type', type);
            formData.append('techStack', techStack.join(','));
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const response = await fetch('/api/proposals', {
                method: 'POST',
                body: formData,
            });

            const contentType = response.headers.get('content-type') || '';
            let payload: { error?: string; _id?: string } | null = null;

            if (contentType.includes('application/json')) {
                payload = await response.json();
            } else {
                const errorText = await response.text();
                payload = errorText ? { error: errorText } : null;
            }

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to create proposal.');
            }

            router.push(`/ideas/${payload?._id}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create proposal.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="saas-card-featured p-6">
                <Link href="/ideas" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors mb-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to My Proposals
                </Link>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-light border border-primary/15 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">Create New Proposal</h1>
                        <p className="text-xs text-muted">Define your initiative, technical stack, and expected impact.</p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 saas-card p-6"
            >
                <div className="space-y-1.5">
                    <label htmlFor="title" className="text-xs font-semibold text-foreground block">
                        Proposal Title
                    </label>
                    <input
                        id="title"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:bg-card focus:ring-3 focus:ring-primary/15 transition-all"
                        placeholder="Give your proposal a clear, descriptive title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={120}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="description"
                        className="text-xs font-semibold text-foreground block"
                    >
                        Description & Scope
                    </label>
                    <textarea
                        id="description"
                        rows={6}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:bg-card focus:ring-3 focus:ring-primary/15 transition-all leading-relaxed"
                        placeholder="Describe the problem, proposed solution, architecture, and expected impact"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={2000}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="type" className="text-xs font-semibold text-foreground block">
                            Proposal Category
                        </label>
                        <select
                            id="type"
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:bg-card focus:ring-3 focus:ring-primary/15 transition-all cursor-pointer"
                            value={type}
                            onChange={(event) => setType(event.target.value as ProposalType)}
                        >
                            <option value="idea">Idea</option>
                            <option value="research">Research</option>
                            <option value="implementation">Implementation</option>
                            <option value="collaboration">Collaboration</option>
                            <option value="protocol">Protocol</option>
                            <option value="node">Node</option>
                            <option value="infrastructure">Infrastructure</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="techStack"
                            className="text-xs font-semibold text-foreground block"
                        >
                            Technology Stack
                        </label>
                        <input
                            id="techStack"
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:bg-card focus:ring-3 focus:ring-primary/15 transition-all"
                            placeholder="React, Node.js, MongoDB"
                            value={techStackInput}
                            onChange={(event) => setTechStackInput(event.target.value)}
                        />
                    </div>
                </div>

                {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {techStack.map(t => (
                            <span key={t} className="pill-info text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label
                        htmlFor="attachment"
                        className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                    >
                        <Upload className="w-3.5 h-3.5 text-primary" /> Attach Specification or Mockup (Optional)
                    </label>
                    <input
                        id="attachment"
                        type="file"
                        accept=".pdf,.docx,.png,.jpg,.jpeg"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary-light file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            setAttachment(file);
                        }}
                    />
                    <p className="text-xs text-muted">Allowed: PDF, DOCX, PNG, JPG. Max size: 5 MB.</p>
                    {attachment ? (
                        <p className="text-xs font-medium text-primary">
                            Selected: {attachment.name} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    ) : null}
                </div>

                {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-600 dark:text-red-300">{error}</p> : null}

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                    <Link
                        href="/ideas"
                        className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted hover:text-foreground hover:bg-background transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-[0_2px_10px_-2px_rgba(98,87,232,0.4)] transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? 'Submitting Proposal…' : 'Submit Proposal'}
                    </button>
                </div>
            </form>
        </div>
    );
}
