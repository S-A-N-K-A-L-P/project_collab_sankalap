import React from 'react';

export const EmptyState = ({ message }: { message: string }) => {
  return <div className="text-center py-12 text-gray-500">{message}</div>;
};
