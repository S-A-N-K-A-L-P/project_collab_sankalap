import React from 'react';

export const Badge = ({ children }: { children: React.ReactNode }) => {
  return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{children}</span>;
};
