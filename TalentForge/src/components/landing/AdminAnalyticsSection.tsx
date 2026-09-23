import React, { useState } from 'react';
import { Users, FolderCheck, Clock, Building2, TrendingUp, BarChart2, ArrowRight } from 'lucide-react';

export const AdminAnalyticsSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [metricTimeframe, setMetricTimeframe] = useState<'30d' | '90d'>('30d');

  const stats = [
    { label: 'Total Enrolled Students', value: '10,450', change: '+14.2%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Faculty Verified Projects', value: '5,280', change: '+18.8%', icon: FolderCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Verification Requests', value: '42', change: 'Avg 4.2h resolution', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Corporate Recruiters', value: '2,150', change: '+22.5%', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  const skillDist = [
    { name: 'Python & AI/ML Systems', count: 4280, pct: 85 },
    { name: 'React & Modern Frontend', count: 3950, pct: 78 },
    { name: 'Cloud Infrastructure (Docker/K8s)', count: 2840, pct: 56 },
    { name: 'Relational DBs (PostgreSQL)', count: 3410, pct: 68 },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Campus & System Intelligence
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Admin Platform Operations
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Real-time oversight over academic departments, verification throughput, accreditation metrics, and hiring conversion across all registered universities.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/admin')}
            className="self-start md:self-end px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.label}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {st.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${st.bg} flex items-center justify-center ${st.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {st.value}
                </div>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{st.change}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Mini Analytics Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Skill Distribution */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Dominant Verified Capability Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Campus Cohort 2026</span>
            </div>

            <div className="space-y-3 pt-2">
              {skillDist.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {item.count.toLocaleString()} students ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-blue-600 h-full rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Throughput Activity */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Departmental Verification SLA
              </h3>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                99.4% On Schedule
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Review Time</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">4.2 Hours</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Faculty Reviewers</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">380 Active</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Invariants</span>
                <span className="text-lg font-bold font-mono text-teal-600 tabular-nums">100% Passed</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              University administrators can review faculty verification logs, maintain compliance with national technical accreditation frameworks, and export tamper-proof accreditation audits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
