'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { Task } from '@/features/project-progress/utils/calculateProjectProgress';
import type { WeeklyReport } from '@/features/project-progress/types/weekly.types';

interface ActivityLog {
  _id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface ProjectProgressContextType {
  projectId: string;
  tasks: Task[];
  activityLogs: ActivityLog[];
  weeklyReports: WeeklyReport[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchActivityLogs: () => Promise<void>;
  fetchWeeklyReports: () => Promise<void>;
  progressData?: any;
  fetchProgressData?: () => Promise<void>;
}

const ProjectProgressContext = createContext<ProjectProgressContextType | undefined>(undefined);

export function ProjectProgressProvider({ children, projectId: propProjectId }: { children: React.ReactNode; projectId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsProjectId = useParams()?.projectId as string;
  const projectId = propProjectId || paramsProjectId || "";

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/project-progress/tasks/project/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchActivityLogs = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/activity?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      const data = await res.json();
      setActivityLogs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchWeeklyReports = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/project-progress/weekly-reports?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch weekly reports');
      const data = await res.json();
      setWeeklyReports(Array.isArray(data) ? data : data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setWeeklyReports([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return (
    <ProjectProgressContext.Provider value={{
      projectId,
      tasks,
      activityLogs,
      weeklyReports,
      loading,
      error,
      fetchTasks,
      fetchActivityLogs,
      fetchWeeklyReports,
    }}>
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
