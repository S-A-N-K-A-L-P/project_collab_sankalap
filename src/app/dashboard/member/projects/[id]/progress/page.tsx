import React from 'react';

export default function ProjectProgressPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Project {params.id} Progress</h1>
    </div>
  );
}
