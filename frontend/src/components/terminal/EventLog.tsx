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
    <div className="bg-[#0d1014] border border-[#20252b] rounded-[2px] font-mono text-[11px] p-2.5 mt-3">
      <div className="flex items-center justify-between border-b border-[#20252b] pb-1.5 mb-2 text-[#8b929a]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#8b929a]" />
          <span className="font-semibold uppercase tracking-wider text-[#e6e7e9] text-[10px]">Protocol Event Stream</span>
          <span className="text-[#5f6670] text-[10px]">({logs.length} events)</span>
        </div>
        <button
          onClick={onClear}
          className="text-[#8b929a] hover:text-[#e6e7e9] flex items-center space-x-1 transition-colors text-[10px] px-1.5 py-0.5 rounded-[2px] border border-[#20252b] bg-[#11151a]"
          title="Clear log"
        >
          <Trash2 className="w-3 h-3" />
          <span>CLEAR</span>
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
        {logs.length === 0 ? (
          <div className="text-[#5f6670] italic py-1">No protocol operations logged yet.</div>
        ) : (
          logs.map((log) => {
            const colorClass =
              log.type === 'error'
                ? 'text-rose-400'
                : log.type === 'warn'
                ? 'text-amber-400'
                : log.type === 'success'
                ? 'text-emerald-400'
                : 'text-[#e6e7e9]';

            return (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-[#5f6670] shrink-0">{log.timestamp}</span>
                <span className="text-[#cbd5e1] shrink-0 font-medium">[{log.source}]</span>
                <span className={colorClass}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
