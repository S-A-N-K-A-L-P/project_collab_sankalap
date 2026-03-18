import React from 'react';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post Detail: {id}</h1>
      <p className="text-slate-500 mt-2">Placeholder for post content and discussion.</p>
    </div>
  );
}
