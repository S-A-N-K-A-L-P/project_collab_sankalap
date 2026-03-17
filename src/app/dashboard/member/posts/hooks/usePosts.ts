import { useState, useEffect } from 'react';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  return { posts };
};
