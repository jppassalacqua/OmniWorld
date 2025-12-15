
import React from 'react';

export const NavItem = ({ icon: Icon, label, active, onClick, danger }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 overflow-hidden whitespace-nowrap group relative ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1' 
        : danger 
          ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
    }`}
    title={label}
  >
    <div className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}><Icon size={20} /></div>
    {label && <span className="font-medium truncate">{label}</span>}
    {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />}
  </button>
);
