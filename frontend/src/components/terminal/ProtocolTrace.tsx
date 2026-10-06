import React, { useState } from 'react';
import { Terminal, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

export type ProtocolActor = 'ALICE' | 'BOB' | 'NETWORK' | 'ATTACKER' | 'SYSTEM' | string;
export type ProtocolDirection = 'outbound' | 'inbound' | 'internal' | 'intercepted';
export type ProtocolEventStatus = 'info' | 'success' | 'warn' | 'error';

export interface ProtocolEvent {
  id: string;
  timestamp: string;
  actor: ProtocolActor;
  action: string;
  direction?: ProtocolDirection;
  status?: ProtocolEventStatus;
  metadata?: Record<string, string | number | boolean>;
}

export interface ProtocolTraceProps {
  events: ProtocolEvent[];
  title?: string;
  onClear?: () => void;
  maxHeight?: string;
  className?: string;
}

const actorStyleMap: Record<string, { text: string; bg: string; border: string }> = {
  ALICE: { text: 'text-[#e6e7e9]', bg: 'bg-[#161a20]', border: 'border-[#20252b]' },
  BOB: { text: 'text-[#cbd5e1]', bg: 'bg-[#11151a]', border: 'border-[#20252b]' },
  NETWORK: { text: 'text-amber-300', bg: 'bg-amber-950/30', border: 'border-amber-800/50' },
  ATTACKER: { text: 'text-rose-300', bg: 'bg-rose-950/30', border: 'border-rose-800/50' },
  SYSTEM: { text: 'text-[#8b929a]', bg: 'bg-[#090b0e]', border: 'border-[#20252b]' }
};

export const ProtocolTrace: React.FC<ProtocolTraceProps> = ({
  events,
  title = 'LIVE PROTOCOL TRACE',
  onClear,
  maxHeight = 'max-h-48',
  className = ''
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`bg-[#0d1014] border border-[#20252b] rounded-[2px] font-mono text-xs select-none ${className}`}
      aria-label="Protocol Analyzer Execution Trace Log"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#20252b] px-3 py-1.5 bg-[#090b0e] text-[#8b929a]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3 h-3 text-[#8b929a]" />
          <span className="font-semibold uppercase tracking-wider text-[#e6e7e9] text-[10px]">{title}</span>
          <span className="text-[#5f6670] text-[10px]">[{events.length} EVENTS]</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[#5f6670] hover:text-[#e6e7e9] flex items-center space-x-1 transition-colors text-[9px] px-1.5 py-0.5 rounded-[2px] hover:bg-[#11151a]"
            title="Clear protocol trace log"
            aria-label="Clear protocol trace log"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>[ CLEAR ]</span>
          </button>
        )}
      </div>

      {/* Protocol Analyzer Rows */}
      <div className={`${maxHeight} overflow-y-auto divide-y divide-[#181d24] pr-1 font-mono text-[10.5px]`}>
        {events.length === 0 ? (
          <div className="text-slate-600 italic py-3 text-center text-[10px]">
            No protocol events recorded in current execution frame.
          </div>
        ) : (
          events.map((evt) => {
            const actor = actorStyleMap[evt.actor] || actorStyleMap.SYSTEM;
            const isError = evt.status === 'error';
            const isWarn = evt.status === 'warn';
            const isSuccess = evt.status === 'success';

            const statusBadge = isError ? (
              <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-rose-950/50 border border-rose-800 text-rose-400 font-bold">
                ERR
              </span>
            ) : isWarn ? (
              <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-amber-950/50 border border-amber-800 text-amber-300">
                WARN
              </span>
            ) : isSuccess ? (
              <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-emerald-950/50 border border-emerald-800 text-emerald-400">
                OK
              </span>
            ) : null;

            const hasMeta = evt.metadata && Object.keys(evt.metadata).length > 0;
            const isExpanded = expandedId === evt.id;

            return (
              <div
                key={evt.id}
                className={`py-1 px-2.5 transition-colors hover:bg-[#0c121d] ${
                  isError ? 'bg-rose-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {/* Timestamp */}
                    <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                      {evt.timestamp}
                    </span>

                    {/* Actor Pill */}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-[2px] border ${actor.border} ${actor.bg} ${actor.text} font-bold shrink-0 uppercase tracking-wide`}
                    >
                      {evt.actor}
                    </span>

                    {/* Action Text */}
                    <span
                      className={`truncate ${
                        isError
                          ? 'text-rose-300 font-semibold'
                          : isWarn
                          ? 'text-amber-200'
                          : isSuccess
                          ? 'text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {evt.action}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {statusBadge}
                    {hasMeta && (
                      <button
                        onClick={() => toggleExpand(evt.id)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Toggle metadata payload"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-[#e6e7e9]" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded metadata payload */}
                {isExpanded && hasMeta && (
                  <div className="mt-1 p-1.5 rounded-[2px] bg-[#050607] border border-[#20252b] text-[10px] text-[#8b929a] space-y-0.5">
                    {Object.entries(evt.metadata!).map(([k, v]) => (
                      <div key={k} className="flex items-center space-x-2">
                        <span className="text-[#5f6670] uppercase">{k}:</span>
                        <span className="text-[#e6e7e9] font-mono break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
