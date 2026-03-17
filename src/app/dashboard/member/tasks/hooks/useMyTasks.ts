import { useState, useEffect } from 'react';

export const useMyTasks = () => {
  const [myTasks, setMyTasks] = useState([]);
  return { myTasks };
};
