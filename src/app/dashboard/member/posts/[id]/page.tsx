import React from 'react';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-xl font-bold">Post {params.id}</h1>
    </div>
  );
}
