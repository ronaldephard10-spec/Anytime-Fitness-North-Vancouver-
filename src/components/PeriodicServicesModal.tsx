import React, { useState, useEffect } from 'react';
import {
  Wrench,
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Save,
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { INITIAL_PERIODIC_SERVICES, PeriodicServiceRecord } from '../utils/scheduleEngine';

interface PeriodicServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCompleted?: (serviceTitle: string) => void;
}

const STORAGE_KEY = 'anytime_fitness_periodic_services';

export const PeriodicServicesModal: React.FC<PeriodicServicesModalProps> = ({
  isOpen,
  onClose,
  onServiceCompleted,
}) => {
  const [services, setServices] = useState<PeriodicServiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_PERIODIC_SERVICES;
  });

  const [filter, setFilter] = useState<'all' | 'due' | 'annual' | 'semi-annual'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch (err) {
      console.error('Failed to persist periodic services', err);
    }
  }, [services]);

  if (!isOpen) return null;

  const handleUpdateStatus = (id: string, status: PeriodicServiceRecord['status']) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const isCompleted = status === 'completed-today' || status === 'up-to-date';
          const updated = {
            ...s,
            status,
            lastDoneDate: isCompleted ? new Date().toISOString().split('T')[0] : s.lastDoneDate,
          };
          if (isCompleted && onServiceCompleted) {
            onServiceCompleted(s.title);
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleSaveNotes = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, notes: tempNotes } : s))
    );
    setEditingId(null);
  };

  const filteredServices = services.filter((s) => {
    if (filter === 'due') return s.status === 'due';
    if (filter === 'annual') return s.frequencyType === 'annual';
    if (filter === 'semi-annual') return s.frequencyType === 'semi-annual';
    return true;
  });

  const dueCount = services.filter((s) => s.status === 'due').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2a1740] via-[#4B286D] to-[#1f1635] px-5 py-4 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  Agreement Page 21 Reference
                </span>
                {dueCount > 0 && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    {dueCount} Service{dueCount > 1 ? 's' : ''} Recommended
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Annual & Periodic Special Services Manager
              </h2>
              <p className="text-xs text-purple-200/80">
                Track floor refinishing, deep carpet extraction, machine scrubbing, and periodic window treatments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: `All Services (${services.length})` },
              { id: 'due', label: `Due / Recommended (${dueCount})` },
              { id: 'annual', label: 'Annual Cycles' },
              { id: 'semi-annual', label: 'Semi-Annual Cycles' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === f.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400 hidden sm:block">
            S.O.P. Specs from Coverall Agreement
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredServices.map((serv) => {
              const isDue = serv.status === 'due';
              const isCompleted = serv.status === 'completed-today' || serv.status === 'up-to-date';
              const isEditing = editingId === serv.id;

              return (
                <div
                  key={serv.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    isDue
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : isCompleted
                      ? 'bg-slate-800/40 border-slate-700/70'
                      : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{serv.title}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                          {serv.frequencyLabel}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isDue
                              ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                              : isCompleted
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {serv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {serv.description}
                      </p>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(serv.id, 'completed-today')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-xs font-semibold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Log Completed</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(serv.id, isDue ? 'up-to-date' : 'due')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          isDue
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600 hover:text-white'
                        }`}
                      >
                        {isDue ? 'Mark Up to Date' : 'Flag as Due'}
                      </button>
                    </div>
                  </div>

                  {/* Metadata and Notes Bar */}
                  <div className="pt-2 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        <strong>Last Completed:</strong>{' '}
                        {serv.lastDoneDate ? serv.lastDoneDate : 'Pending schedule'}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Ref:</strong> {serv.contractReference}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <input
                            type="text"
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add notes / date / contractor..."
                            className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded border border-slate-600 focus:outline-none focus:border-purple-400 w-full sm:w-64"
                          />
                          <button
                            onClick={() => handleSaveNotes(serv.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                            title="Save note"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:text-slate-300"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {serv.notes && (
                            <span className="text-slate-300 italic text-xs">
                              &quot;{serv.notes}&quot;
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(serv.id);
                              setTempNotes(serv.notes || '');
                            }}
                            className="text-purple-400 hover:text-purple-300 font-medium underline text-xs"
                          >
                            {serv.notes ? 'Edit note' : '+ Add service note'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-5 py-3.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <span>Changes persist automatically to your local inspection device</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
