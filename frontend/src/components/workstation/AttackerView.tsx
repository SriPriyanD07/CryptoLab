import React from 'react';
import { Eye, Lock, Copy, Check, AlertOctagon } from 'lucide-react';

export interface AttackerItem {
  id: string;
  label: string;
  value?: string;
  detail?: string;
}

export interface AttackerViewProps {
  title?: string;
  threatModel?: string;
  observable: AttackerItem[];
  protectedItems: AttackerItem[];
  tampered?: boolean;
  tamperMessage?: string;
  notes?: string;
  className?: string;
}

export const AttackerView: React.FC<AttackerViewProps> = ({
  title = 'NETWORK OBSERVATION',
  threatModel = 'Dolev-Yao Network Adversary (Full Wire Sniffing & In-Transit Interception)',
  observable,
  protectedItems,
  tampered,
  tamperMessage,
  notes,
  className = ''
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      className={`bg-[#080c14] border ${
        tampered ? 'border-rose-900/80' : 'border-[#182130]'
      } rounded-[2px] font-mono text-xs select-none ${className}`}
      aria-label="Adversary Wire Observability Matrix"
    >
      {/* Header */}
      <div className="border-b border-[#20252b] px-2.5 py-1.5 bg-[#090b0e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Eye className="w-3 h-3 text-amber-400" />
            <span className="font-semibold text-[#e6e7e9] tracking-wider text-[10px] uppercase">
              {title}
            </span>
          </div>
          <span className="text-[9px] text-amber-400 font-semibold tracking-wider px-1.5 py-0.2 rounded-[2px] bg-amber-950/30 border border-amber-800/50 uppercase">
            PASSIVE WIRE SNIFFER
          </span>
        </div>
        {threatModel && (
          <div className="text-[9px] text-[#5f6670] font-mono mt-0.5 truncate">
            Model: {threatModel}
          </div>
        )}
      </div>

      {/* Tampering Alert Banner (if applicable) */}
      {tampered && (
        <div className="px-2.5 py-1.5 bg-rose-950/30 border-b border-rose-900/60 flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5 text-rose-300 font-bold">
            <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
            <span>INTERCEPTED &rarr; MODIFIED &rarr; AUTHENTICATION FAILED</span>
          </div>
          {tamperMessage && (
            <span className="text-[#8b929a] font-mono text-[9px]">[{tamperMessage}]</span>
          )}
        </div>
      )}

      {/* Dual Columns: Observable vs Protected */}
      <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
        {/* Observable Column */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1 text-[9px] font-bold text-[#e6e7e9] uppercase tracking-wider border-b border-[#20252b] pb-0.5">
            <span>OBSERVABLE ON WIRE</span>
            <span className="text-[#8b929a]">[{observable.length}]</span>
          </div>

          <div className="divide-y divide-[#181d24] border border-[#20252b] rounded-[2px] bg-[#090b0e]">
            {observable.length === 0 ? (
              <div className="text-[#5f6670] italic p-1.5 text-center">No transmissions observed.</div>
            ) : (
              observable.map((item) => (
                <div key={item.id} className="p-1.5 flex items-center justify-between gap-1">
                  <div className="flex items-center space-x-1 min-w-0">
                    <span className="text-[#8b929a] font-bold text-[9px] shrink-0">&bull;</span>
                    <span className="text-[#e6e7e9] truncate font-semibold">{item.label}</span>
                  </div>

                  {item.value ? (
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-[#cbd5e1] font-mono text-[9px] max-w-[80px] truncate select-all">
                        {item.value}
                      </span>
                      <button
                        onClick={() => handleCopy(item.id, item.value!)}
                        className="p-0.5 text-slate-500 hover:text-slate-300"
                        title="Copy captured wire value"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  ) : item.detail ? (
                    <span className="text-slate-500 text-[9px] truncate">{item.detail}</span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Protected Column */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-950/80 pb-0.5">
            <span>PROTECTED / NOT TRANSMITTED</span>
            <span>[{protectedItems.length}]</span>
          </div>

          <div className="divide-y divide-[#181d24] border border-[#20252b] rounded-[2px] bg-[#090b0e]">
            {protectedItems.length === 0 ? (
              <div className="text-[#5f6670] italic p-1.5 text-center">No protected parameters.</div>
            ) : (
              protectedItems.map((item) => (
                <div key={item.id} className="p-1.5 flex items-center justify-between gap-1">
                  <div className="flex items-center space-x-1 min-w-0">
                    <Lock className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                    <span className="text-[#cbd5e1] truncate font-semibold">{item.label}</span>
                  </div>
                  <span className="text-emerald-500/80 text-[8.5px] uppercase font-bold shrink-0">
                    CONFIDENTIAL
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {notes && (
        <div className="px-2.5 py-1.5 border-t border-[#20252b] bg-[#090b0e] text-[9px] text-[#5f6670] font-mono">
          {notes}
        </div>
      )}
    </div>
  );
};
