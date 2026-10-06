import React, { useState } from 'react';
import { Binary, Eye, EyeOff, Copy, Check } from 'lucide-react';

export interface InspectorField {
  id: string;
  label: string;
  value: string | null | undefined;
  sensitive?: boolean;
  copyable?: boolean;
  tag?: string;
  detail?: string;
}

export interface InspectorSection {
  id: string;
  title?: string;
  fields: InspectorField[];
}

export interface CryptoInspectorProps {
  title?: string;
  protocol?: string;
  sections?: InspectorSection[];
  fields?: InspectorField[];
  className?: string;
}

export const CryptoInspector: React.FC<CryptoInspectorProps> = ({
  title = 'CRYPTO INSPECTOR',
  protocol,
  sections,
  fields,
  className = ''
}) => {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const resolvedSections: InspectorSection[] = sections
    ? sections
    : fields
    ? [{ id: 'default', fields }]
    : [];

  return (
    <div
      className={`bg-[#0d1014] border border-[#20252b] rounded-[2px] font-mono text-xs select-none ${className}`}
      aria-label="Cryptographic State and Parameter Inspector"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#20252b] px-2.5 py-1.5 bg-[#090b0e]">
        <div className="flex items-center space-x-1.5">
          <Binary className="w-3 h-3 text-[#8b929a]" />
          <span className="font-semibold text-[#e6e7e9] tracking-wider text-[10px] uppercase">
            {title}
          </span>
        </div>
        {protocol && (
          <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded-[2px] bg-[#11151a] border border-[#20252b] text-[#8b929a] uppercase">
            {protocol}
          </span>
        )}
      </div>

      {/* Field Table / Rows */}
      <div className="p-2 space-y-2.5">
        {resolvedSections.map((section) => (
          <div key={section.id} className="space-y-1">
            {section.title && (
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">
                {section.title}
              </div>
            )}

            <div className="divide-y divide-[#181d24] border border-[#20252b] rounded-[2px] bg-[#090b0e]">
              {section.fields.map((field) => {
                const isSensitive = field.sensitive ?? false;
                const isRevealed = revealedIds[field.id] ?? false;
                const rawValue = field.value || '<unassigned>';
                const displayValue = isSensitive && !isRevealed ? '••••••••••••••••' : rawValue;
                const isCopied = copiedId === field.id;

                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between px-2 py-1.5 text-[10.5px] hover:bg-[#11151a] transition-colors gap-2"
                  >
                    {/* Key Label */}
                    <div className="flex items-center space-x-1.5 shrink-0 min-w-[90px]">
                      <span className="text-[#8b929a] text-[10px] uppercase font-semibold">
                        {field.label}:
                      </span>
                      {field.tag && (
                        <span className="text-[8px] px-1 bg-[#11151a] border border-[#20252b] text-[#5f6670] rounded-[2px]">
                          {field.tag}
                        </span>
                      )}
                    </div>

                    {/* Value + Controls */}
                    <div className="flex items-center space-x-2 min-w-0 grow justify-end">
                      <div className="font-mono text-[#e6e7e9] truncate select-all text-right text-[10px]">
                        {displayValue}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {isSensitive && (
                          <button
                            onClick={() => toggleReveal(field.id)}
                            className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                            title={isRevealed ? 'Conceal parameter' : 'Reveal parameter'}
                          >
                            {isRevealed ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                          </button>
                        )}

                        {field.copyable !== false && field.value && (
                          <button
                            onClick={() => handleCopy(field.id, field.value!)}
                            className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy to clipboard"
                          >
                            {isCopied ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
