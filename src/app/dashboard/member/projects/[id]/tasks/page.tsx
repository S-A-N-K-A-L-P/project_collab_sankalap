import React from 'react';

export default function ProjectTasksPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Project {params.id} Tasks</h1>
    </div>
  );
}
