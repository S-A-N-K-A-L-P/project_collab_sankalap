import React from 'react';

export const ApplicationStatus = ({ status }: { status: string }) => {
  return <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">{status}</span>;
};
