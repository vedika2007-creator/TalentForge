import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Github, ExternalLink, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeacherVerificationPreviewSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [status, setStatus] = useState<'pending' | 'verified' | 'revision'>('pending');

  const handleVerify = () => {
    setStatus('verified');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#38bdf8', '#7c3aed', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleRequestChanges = () => {
    setStatus('revision');
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
            Academic Governance & Endorsement
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Teacher Verification Queue
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Teachers and faculty mentors don&apos;t just post grades—they validate actual pull requests, live demos, and proctored reports to establish indisputable student capability.
          </p>
        </div>

        {/* Verification Card Preview */}
        <div className="max-w-3xl mx-auto bg-slate-50/70 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Pending Faculty Verification Queue</span>
            </div>
            <span className="text-xs font-mono text-slate-500">Submission #VER-2026-089</span>
          </div>

          {/* Student details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                alt="Priya Sharma"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">Priya Sharma</h4>
                <p className="text-xs text-slate-500">B.Tech AI & Data Science · Sem 7</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block uppercase font-semibold">Submitted Project</span>
              <span className="text-sm font-bold text-slate-800">
                AI-Based Crop Disease Detection
              </span>
            </div>
          </div>

          {/* Submitted Evidence Checklist */}
          <div className="space-y-3 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted Artifacts for Review
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <Github className="w-4 h-4 text-slate-600" />
                  GitHub Repository (Clean Commits)
                </span>
                <span className="text-emerald-600 font-bold">✓ Attached</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Technical Project Report (PDF)
                </span>
                <span className="text-emerald-600 font-bold">✓ Attached</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <ExternalLink className="w-4 h-4 text-cyan-600" />
                  Interactive Live Web Demo
                </span>
                <span className="text-emerald-600 font-bold">✓ Active</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <Award className="w-4 h-4 text-purple-600" />
                  Symposium Finalist Certificate
                </span>
                <span className="text-emerald-600 font-bold">✓ Verified</span>
              </div>
            </div>
          </div>

          {/* Status feedback & Interactive buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {status === 'pending' && (
                <p className="text-xs text-slate-500">
                  Awaiting review by faculty mentor. Try clicking <strong>Verify</strong>!
                </p>
              )}
              {status === 'verified' && (
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully Endorsed! Student capability score updated to 94%.
                </p>
              )}
              {status === 'revision' && (
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Revision request sent with mentor remarks to student inbox.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleRequestChanges}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Request Changes
              </button>

              <button
                onClick={handleVerify}
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Endorse</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('/teacher')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
          >
            <span>Open Faculty Verification Portal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
};
