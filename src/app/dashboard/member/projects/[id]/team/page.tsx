import React from 'react';

export default function ProjectTeamPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Project {params.id} Team</h1>
    </div>
  );
}
