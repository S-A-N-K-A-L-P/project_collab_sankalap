'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter } from 'lucide-react';

const LinkedInIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
  >
    <title>LinkedIn</title>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.025-3.039-1.852-3.039-1.853 0-2.136 1.445-2.136 2.939v5.669H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.369-1.852 3.603 0 4.269 2.372 4.269 5.456v6.287zM5.337 7.433c-1.144 0-2.07-.928-2.07-2.071 0-1.144.927-2.071 2.07-2.071 1.144 0 2.071.927 2.071 2.071 0 1.143-.927 2.071-2.071 2.071zM6.997 20.452H3.678V9h3.319v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.225.792 24 1.771 24h20.451C23.205 24 24 23.225 24 22.273V1.727C24 .774 23.205 0 22.225 0z" />
  </svg>
);

const members = [
  { name: "Tushar Yadav", role: "Senior Architect", bio: "Leading design and architecture efforts." },
  { name: "Jaspreet Singh", role: "System Architect", bio: "Focuses on scalable infrastructures." },
  { name: "Anish Sharma", role: "Platform Architect", bio: "Building developer-facing platforms." },
  { name: "Deepinder Singh", role: "Integration Architect", bio: "Connecting systems and teams." },
  { name: "Arnav Sood", role: "Product Architect", bio: "Shaping product vision and roadmaps." }
];

const communityMembers = [
  { name: "Raghav Arora", role: "Community Member", bio: "Active contributor and participant." },
  { name: "Shivam Goyal", role: "Community Member", bio: "Engages with projects and feedback." },
  { name: "Ayush Patial", role: "Community Member", bio: "Supports events and outreach." },
  { name: "Satyam Narayan", role: "Community Member", bio: "Helps curate resources and discussions." },
  { name: "Saksham Sharma", role: "Community Member", bio: "Community organizer and advocate." },
  { name: "Akagarta Arora", role: "Community Member", bio: "Contributor and mentor." },
  { name: "Kanika Bhatia", role: "Community Member", bio: "Advances community initiatives." }
];

export const MemberSpotlight = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/30 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Architects</span></h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800"
            >
              <div className="mb-6 relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-mono mb-4">{member.role}</p>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {member.bio}
              </p>

              <div className="flex gap-4">
                <Github size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                <Twitter size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                <LinkedInIcon size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors" />
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Community Members</span></h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {communityMembers.map((member, idx) => (
              <motion.div
                key={`community-${idx}`}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800"
              >
                <div className="mb-6 relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-mono mb-4">{member.role}</p>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {member.bio}
                </p>

                <div className="flex gap-4">
                  <Github size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                  <Twitter size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                  <LinkedInIcon size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
