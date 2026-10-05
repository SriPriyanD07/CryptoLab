import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type?: 'info' | 'success' | 'warn' | 'error';
}

interface EventLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded font-mono text-[11px] p-3 mt-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold uppercase tracking-wider text-slate-300">Protocol Event Stream</span>
          <span className="text-slate-500">({logs.length} events)</span>
        </div>
        <button
          onClick={onClear}
          className="text-slate-500 hover:text-slate-300 flex items-center space-x-1 transition-colors text-[10px]"
          title="Clear log"
        >
          <Trash2 className="w-3 h-3" />
          <span>CLEAR</span>
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-1">No protocol operations logged yet.</div>
        ) : (
          logs.map((log) => {
            const colorClass =
              log.type === 'error'
                ? 'text-rose-400'
                : log.type === 'warn'
                ? 'text-amber-400'
                : log.type === 'success'
                ? 'text-emerald-400'
                : 'text-slate-300';

            return (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span className="text-sky-400/90 shrink-0">[{log.source}]</span>
                <span className={colorClass}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
