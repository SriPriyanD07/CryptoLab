import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export type StatusLevel =
  | 'idle'
  | 'active'
  | 'complete'
  | 'established'
  | 'pending'
  | 'verified'
  | 'failed';

export interface SecurityStatusItem {
  id: string;
  label: string;
  status: StatusLevel;
  detail?: string;
}

export interface SecurityStatusProps {
  title?: string;
  keyExchange?: 'idle' | 'active' | 'established' | 'failed';
  keyDerivation?: 'idle' | 'active' | 'complete' | 'failed';
  encryption?: 'idle' | 'active' | 'complete' | 'failed';
  authentication?: 'idle' | 'pending' | 'verified' | 'failed';
  customItems?: SecurityStatusItem[];
  className?: string;
}

const statusConfig: Record<
  StatusLevel,
  { label: string; dotClass: string; textClass: string; bgClass: string; borderClass: string }
> = {
  idle: {
    label: 'IDLE',
    dotClass: 'bg-slate-600',
    textClass: 'text-slate-500',
    bgClass: 'bg-[#080c13]',
    borderClass: 'border-[#151c27]'
  },
  active: {
    label: 'ACTIVE',
    dotClass: 'bg-amber-400 animate-pulse',
    textClass: 'text-amber-400',
    bgClass: 'bg-[#141006]',
    borderClass: 'border-amber-900/50'
  },
  established: {
    label: 'ESTABLISHED',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
    bgClass: 'bg-[#081310]',
    borderClass: 'border-emerald-950/80'
  },
  complete: {
    label: 'COMPLETE',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
    bgClass: 'bg-[#081310]',
    borderClass: 'border-emerald-950/80'
  },
  pending: {
    label: 'PENDING',
    dotClass: 'bg-amber-400 animate-pulse',
    textClass: 'text-amber-400',
    bgClass: 'bg-[#141006]',
    borderClass: 'border-amber-900/60'
  },
  verified: {
    label: 'VERIFIED',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
    bgClass: 'bg-[#081310]',
    borderClass: 'border-emerald-900/60'
  },
  failed: {
    label: 'FAILED',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-400 font-bold',
    bgClass: 'bg-rose-950/30',
    borderClass: 'border-rose-700'
  }
};

export const SecurityStatus: React.FC<SecurityStatusProps> = ({
  title = 'SESSION STATUS',
  keyExchange,
  keyDerivation,
  encryption,
  authentication,
  customItems,
  className = ''
}) => {
  // Build items list
  const items: SecurityStatusItem[] = customItems ? [...customItems] : [];

  if (!customItems) {
    if (keyExchange) items.push({ id: 'key_exchange', label: 'KEY EXCHANGE', status: keyExchange });
    if (keyDerivation) items.push({ id: 'key_derivation', label: 'KEY DERIVATION', status: keyDerivation });
    if (encryption) items.push({ id: 'encryption', label: 'ENCRYPTION', status: encryption });
    if (authentication) items.push({ id: 'authentication', label: 'AUTHENTICATION', status: authentication });
  }

  const displayItems =
    items.length > 0
      ? items
      : [
          { id: 'key_exchange', label: 'KEY EXCHANGE', status: 'idle' as StatusLevel },
          { id: 'key_derivation', label: 'KEY DERIVATION', status: 'idle' as StatusLevel },
          { id: 'encryption', label: 'ENCRYPTION', status: 'idle' as StatusLevel },
          { id: 'authentication', label: 'AUTHENTICATION', status: 'idle' as StatusLevel }
        ];

  const hasFailure = displayItems.some((i) => i.status === 'failed');

  return (
    <div
      className={`bg-[#0d1014] border ${
        hasFailure ? 'border-rose-900/80' : 'border-[#20252b]'
      } rounded-[2px] font-mono text-[11px] p-2 select-none ${className}`}
      aria-label="Cryptographic Security and Protocol Session Status"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Rail Header / Title */}
        <div className="flex items-center space-x-2 shrink-0">
          {hasFailure ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold text-[#e6e7e9] tracking-wider text-[10px] uppercase">
            {title}
          </span>
          <span className="text-[#5f6670]">|</span>
          <span className={`text-[9px] font-bold uppercase ${hasFailure ? 'text-rose-400' : 'text-[#8b929a]'}`}>
            {hasFailure ? 'ALERT: REJECTED' : 'TELEMETRY OK'}
          </span>
        </div>

        {/* Compact Horizontal Status Rail */}
        <div className="flex flex-wrap items-center gap-1.5 grow sm:justify-end">
          {displayItems.map((item) => {
            const cfg = statusConfig[item.status] || statusConfig.idle;
            return (
              <div
                key={item.id}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-[2px] border ${cfg.borderClass} ${cfg.bgClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} aria-hidden="true" />
                <span className="text-slate-400 text-[10px] uppercase">{item.label}:</span>
                <span className={`text-[10px] ${cfg.textClass}`}>{cfg.label}</span>
                {item.detail && <span className="text-[9px] text-slate-500">[{item.detail}]</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
