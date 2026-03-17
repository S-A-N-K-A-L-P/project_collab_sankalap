import React from 'react';

export const ErrorState = ({ message }: { message: string }) => {
  return <div className="text-center py-12 text-red-500">{message}</div>;
};
