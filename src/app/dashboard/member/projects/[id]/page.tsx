import React from 'react';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Project {params.id}</h1>
    </div>
  );
}
