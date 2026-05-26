import React from 'react';

export default function StatsCard({ title, value, icon: Icon, description, trend, colorClass = 'from-primary-500 to-primary-600' }) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-tr ${colorClass} text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 border-t border-white/5 pt-3">
        <span className="text-slate-500 text-xs font-medium">
          {description}
        </span>
        {trend && (
          <span className="text-teal-400 text-xs font-bold bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
