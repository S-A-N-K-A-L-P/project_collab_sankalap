import React from 'react';

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-white rounded-lg shadow p-4">{children}</div>;
};
