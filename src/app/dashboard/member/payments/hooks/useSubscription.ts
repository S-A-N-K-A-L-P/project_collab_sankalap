import { useState, useEffect } from 'react';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  return { subscription };
};
