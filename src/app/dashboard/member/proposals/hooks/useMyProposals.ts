import { useState, useEffect } from 'react';

export const useMyProposals = () => {
  const [myProposals, setMyProposals] = useState([]);
  return { myProposals };
};
