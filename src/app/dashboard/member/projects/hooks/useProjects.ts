import { useState, useEffect } from 'react';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  return { projects };
};
