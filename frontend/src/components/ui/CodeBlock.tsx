import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  label?: string;
  value: string;
  highlight?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ label, value, highlight }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-1.5 font-mono text-xs">
      {label && <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">{label}</div>}
      <div className={`flex items-start justify-between bg-slate-950/80 border ${highlight ? 'border-sky-500/50 bg-sky-950/20' : 'border-slate-800'} rounded p-2.5 transition-colors`}>
        <div className="break-all font-mono text-slate-200 select-all leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {value || '<empty>'}
        </div>
        <button
          onClick={handleCopy}
          className="ml-2 text-slate-500 hover:text-slate-200 transition-colors p-1 shrink-0"
          title="Copy value"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
