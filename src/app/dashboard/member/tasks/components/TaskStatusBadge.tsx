import React from 'react';

export const TaskStatusBadge = ({ status }: { status: string }) => {
  return <span className="px-2 py-1 rounded bg-gray-200 text-xs">{status}</span>;
};
