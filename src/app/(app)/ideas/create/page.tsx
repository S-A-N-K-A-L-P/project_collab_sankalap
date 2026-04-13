'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

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

            const payload = await response.json();
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Proposal</h1>
                <Link href="/ideas" className="text-sm text-muted hover:text-foreground transition-colors">
                    Back to My Ideas
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm"
            >
                <div className="space-y-1.5">
                    <label htmlFor="title" className="text-[11px] font-bold uppercase tracking-widest text-muted">
                        Title
                    </label>
                    <input
                        id="title"
                        className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                        placeholder="Give your proposal a clear title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={120}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="description"
                        className="text-[11px] font-bold uppercase tracking-widest text-muted"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={6}
                        className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                        placeholder="Describe the problem, proposed solution, and expected impact"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={2000}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="type" className="text-[11px] font-bold uppercase tracking-widest text-muted">
                            Type
                        </label>
                        <select
                            id="type"
                            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
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
                            className="text-[11px] font-bold uppercase tracking-widest text-muted"
                        >
                            Tech Stack
                        </label>
                        <input
                            id="techStack"
                            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                            placeholder="React, Node.js, MongoDB"
                            value={techStackInput}
                            onChange={(event) => setTechStackInput(event.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="attachment"
                        className="text-[11px] font-bold uppercase tracking-widest text-muted"
                    >
                        Attach File (Optional)
                    </label>
                    <input
                        id="attachment"
                        type="file"
                        accept=".pdf,.docx,.png,.jpg,.jpeg"
                        className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-accent/90"
                        onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            setAttachment(file);
                        }}
                    />
                    <p className="text-xs text-muted">Allowed: PDF, DOCX, PNG, JPG. Max size: 5 MB.</p>
                    {attachment ? (
                        <p className="text-xs text-muted">
                            Selected: {attachment.name} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    ) : null}
                </div>

                {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

                <div className="flex items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-muted">{techStack.length > 0 ? `Tags: ${techStack.join(', ')}` : 'Add comma-separated tags (optional)'}</p>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? 'Creating...' : 'Create Proposal'}
                    </button>
                </div>
            </form>
        </div>
    );
}
