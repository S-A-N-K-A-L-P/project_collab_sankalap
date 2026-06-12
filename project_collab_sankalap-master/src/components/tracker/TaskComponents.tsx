"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, MoreVertical, Plus, User, Calendar } from "lucide-react";

export function TaskList({ tasks, onAddTask }: { tasks: any[], onAddTask: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1f1f23] font-mono">Tactical Backlog</h3>
        <button 
          onClick={onAddTask}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 text-[10px] font-bold text-[#6366f1] uppercase tracking-wider hover:bg-[#6366f1]/20 transition-all"
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
      className="group flex items-center justify-between p-4 bg-[#121214] border border-[#1f1f23] rounded-2xl hover:border-[#2a2a2f] transition-all cursor-default"
    >
      <div className="flex items-center gap-4">
        <button className="text-[#1f1f23] hover:text-[#6366f1] transition-colors">
          {task.completed ? <CheckCircle2 className="w-5 h-5 text-[#6366f1]" /> : <Circle className="w-5 h-5" />}
        </button>
        <div className="flex flex-col">
          <span className={`text-[14px] font-bold tracking-tight ${task.completed ? "text-[#1f1f23] line-through" : "text-[#e5e7eb]"}`}>
            {task.title}
          </span>
          <div className="flex items-center gap-3 mt-1 opacity-60">
             <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#1f1f23] uppercase">
                <User className="w-2.5 h-2.5" /> {task.assignee || "Unassigned"}
             </div>
             <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#1f1f23] uppercase">
                <Calendar className="w-2.5 h-2.5" /> Due: {task.dueDate || "TBD"}
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
          task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#17171a] border-[#1f1f23] text-[#1f1f23]'
        }`}>
          {task.priority || 'NORMAL'}
        </span>
        <button className="p-1 px-2 rounded-lg hover:bg-white/[0.02] text-[#1f1f23] transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
