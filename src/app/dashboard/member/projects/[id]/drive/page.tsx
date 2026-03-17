import React from 'react';

export default function ProjectDrivePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Project {params.id} Drive</h1>
    </div>
  );
}
