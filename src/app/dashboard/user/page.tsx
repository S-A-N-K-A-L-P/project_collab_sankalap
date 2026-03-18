"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Book, Code, Globe, MessageSquare } from "lucide-react";

export default function UserDashboard() {
  const { data: session } = useSession();

  const stats = [
    { label: "Courses Joined", value: "3", icon: Book, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Projects Built", value: "12", icon: Code, color: "text-green-600", bg: "bg-green-100" },
    { label: "Community Rank", value: "#450", icon: Globe, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Forum Posts", value: "28", icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {session?.user?.name}!</h1>
        <p className="text-slate-500 dark:text-slate-400">Here&apos;s what&apos;s happening with your Pixel account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} dark:bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-64 flex flex-col justify-center items-center">
            <p className="text-slate-400 italic font-medium">Activity Chart Placeholder</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-64 flex flex-col justify-center items-center">
            <p className="text-slate-400 italic font-medium">Upcoming Events Placeholder</p>
        </div>
      </div>
    </div>
  );
}
