import React from 'react';

export default function ProjectGithubPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Project {params.id} GitHub</h1>
    </div>
  );
}
