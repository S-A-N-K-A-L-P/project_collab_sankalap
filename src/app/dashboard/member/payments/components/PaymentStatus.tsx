import React from 'react';

export const PaymentStatus = ({ status }: { status: string }) => {
  return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">{status}</span>;
};
