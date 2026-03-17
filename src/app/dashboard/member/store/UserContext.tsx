'use client';
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState(null);
  return <UserContext.Provider value={{ profile, setProfile }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
