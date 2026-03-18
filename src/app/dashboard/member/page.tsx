"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Award, Zap, Users, Share2, Star } from "lucide-react";

export default function MemberDashboard() {
  const { data: session } = useSession();

  const achievements = [
    { title: "Core Contributor", date: "Mar 2024", icon: Award, color: "text-amber-500" },
    { title: "Project Lead", date: "Jan 2024", icon: Zap, color: "text-blue-500" },
    { title: "Community Mentor", date: "Dec 2023", icon: Users, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Pixel Member HQ <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Exclusive access for our core builders and designers.</p>
        </div>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Member Spotlight</h2>
              <p className="text-blue-100 max-w-md">You&apos;ve completed 4 sprints this month! Your contribution momentum is in the top 5% of the club.</p>
              <button className="mt-6 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share Progress
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-48 flex flex-col justify-center items-center">
              <p className="text-slate-400 italic">Project Pipeline</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-48 flex flex-col justify-center items-center">
              <p className="text-slate-400 italic">Collaboration Space</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Badges & Awards</h3>
            <div className="space-y-4">
              {achievements.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-default"
                >
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Internal Commits</h3>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm">Commit Activity Heatmap</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
