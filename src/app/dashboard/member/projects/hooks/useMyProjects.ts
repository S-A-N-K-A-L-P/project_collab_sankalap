import { useState, useEffect } from 'react';

export const useMyProjects = () => {
  const [myProjects, setMyProjects] = useState([]);
  return { myProjects };
};
