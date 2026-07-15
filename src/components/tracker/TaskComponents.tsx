"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, MoreVertical, Plus, User, Calendar } from "lucide-react";

export function TaskList({ tasks, onAddTask }: { tasks: any[], onAddTask: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">Tactical Backlog</h3>
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3 h-3" /> Initialize Task
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task, i) => (
          <TaskCard key={i} task={task} index={i} />
        ))}
      </div>
    </div>
  );
}

export function TaskCard({ task, index }: { task: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-border-strong transition-all cursor-default"
    >
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-primary transition-colors">
          {task.completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
        </button>
        <div className="flex flex-col">
          <span className={`text-[14px] font-bold tracking-tight ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {task.title}
          </span>
          <div className="flex items-center gap-3 mt-1 opacity-60">
             <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase">
                <User className="w-2.5 h-2.5" /> {task.assignee || "Unassigned"}
             </div>
             <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase">
                <Calendar className="w-2.5 h-2.5" /> Due: {task.dueDate || "TBD"}
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
          task.priority === 'high' ? 'bg-error/10 border-error/20 text-error' : 'bg-muted-bg border-border text-muted-foreground'
        }`}>
          {task.priority || 'NORMAL'}
        </span>
        <button className="p-1 px-2 rounded-lg hover:bg-muted-bg text-muted-foreground transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
