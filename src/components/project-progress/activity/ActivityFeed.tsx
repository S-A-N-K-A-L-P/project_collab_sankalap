'use client';

import React from 'react';

interface ActivityLog {
  _id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export default function ActivityFeed({ logs }: ActivityFeedProps) {
  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'unknown-datetime' : `${date.toISOString().split('T')[0]} ${date.toISOString().slice(11, 16)}`;
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No activity logs available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log._id} className="border border-slate-700 rounded-lg p-4 bg-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-100">{log.action}</h3>
              <p className="text-sm text-slate-400">{log.user}</p>
              {log.details && <p className="text-sm text-slate-300 mt-2">{log.details}</p>}
            </div>
            <p className="text-xs text-slate-500">{formatDateTime(log.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
