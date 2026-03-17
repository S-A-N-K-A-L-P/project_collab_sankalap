import { useState, useEffect } from 'react';

export const useProposals = () => {
  const [proposals, setProposals] = useState([]);
  return { proposals };
};
