import React from 'react';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Task {params.id}</h1>
    </div>
  );
}
