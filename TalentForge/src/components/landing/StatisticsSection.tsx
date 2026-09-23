import React, { useState, useEffect } from 'react';
import { Users, FolderCheck, Building2, Target } from 'lucide-react';

export const StatisticsSection: React.FC = () => {
  const [counts, setCounts] = useState({
    students: 0,
    projects: 0,
    companies: 0,
    accuracy: 0,
  });

  useEffect(() => {
    // Simple smooth counter animation on mount
    const duration = 1200;
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        students: Math.floor(progress * 10450),
        projects: Math.floor(progress * 5280),
        companies: Math.floor(progress * 2150),
        accuracy: Math.floor(progress * 95),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({
          students: 10450,
          projects: 5280,
          companies: 2150,
          accuracy: 95,
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      id: 'students',
      label: 'Active Students',
      value: `${(counts.students / 1000).toFixed(1)}K+`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      detail: 'Across 48 partner engineering colleges',
    },
    {
      id: 'projects',
      label: 'Verified Projects',
      value: `${(counts.projects / 1000).toFixed(1)}K+`,
      icon: FolderCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      detail: 'Faculty code & rubric reviewed',
    },
    {
      id: 'companies',
      label: 'Hiring Companies',
      value: `${(counts.companies / 1000).toFixed(1)}K+`,
      icon: Building2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      detail: 'Direct evidence-based talent pipeline',
    },
    {
      id: 'accuracy',
      label: 'Talent Match Accuracy',
      value: `${counts.accuracy}%`,
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      detail: 'Algorithmic capability alignment',
    },
  ];

  return (
    <section className="py-12 bg-slate-50/60 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Real-time Network Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-normal">Prototype / College Demonstration Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                  {item.value}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-normal">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
