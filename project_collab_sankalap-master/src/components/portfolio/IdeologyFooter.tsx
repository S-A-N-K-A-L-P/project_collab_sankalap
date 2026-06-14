'use client';

import React from 'react';

export const IdeologyFooter = () => {
  return (
    <footer className="py-20 bg-slate-950 border-t border-slate-900 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
           <h2 className="text-2xl font-black text-white mb-6">S.A.N.K.A.L.P. Community</h2>
           <p className="text-slate-500 max-w-sm">Architecting the future through decentralized collaboration and radical engineering ethics.</p>
        </div>
        <div>
           <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">Navigation</h4>
           <ul className="text-slate-500 space-y-2">
             <li><a href="#" className="hover:text-white transition-colors">Manifesto</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Governance</a></li>
           </ul>
        </div>
        <div>
           <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">Social</h4>
           <ul className="text-slate-500 space-y-2">
             <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
             <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
           </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900 text-slate-600 text-sm flex justify-between">
         <span>© 2026 S.A.N.K.A.L.P. Collective. All rights reserved.</span>
         <span className="font-mono">Built for the future.</span>
      </div>
    </footer>
  );
};
