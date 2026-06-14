'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface ActivityLog {
  _id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface ProjectProgressContextType {
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
  fetchActivityLogs: () => Promise<void>;
  progressData?: any;
  fetchProgressData?: () => Promise<void>;
}

const ProjectProgressContext = createContext<ProjectProgressContextType | undefined>(undefined);

export function ProjectProgressProvider({ children, projectId }: { children: React.ReactNode; projectId?: string }) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsProjectId = useParams()?.projectId as string;
  const resolvedProjectId = projectId || paramsProjectId;

  const fetchActivityLogs = useCallback(async () => {
    if (!resolvedProjectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/activity?projectId=${resolvedProjectId}`);
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      
      const data = await res.json();
      setActivityLogs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedProjectId]);

  const value: ProjectProgressContextType = {
    activityLogs,
    loading,
    error,
    fetchActivityLogs,
  };

  return (
    <ProjectProgressContext.Provider value={value}>
      {children}
    </ProjectProgressContext.Provider>
  );
}

export function useProjectProgress(): ProjectProgressContextType {
  const context = useContext(ProjectProgressContext);
  if (!context) {
    throw new Error('useProjectProgress must be used within ProjectProgressProvider');
  }
  return context;
}
