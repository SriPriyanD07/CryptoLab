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
      {label && <div className="text-[10px] text-[#8b929a] uppercase tracking-wider mb-1 font-semibold">{label}</div>}
      <div className={`flex items-start justify-between bg-[#090b0e] border ${highlight ? 'border-[#3f4752] bg-[#161a20]' : 'border-[#20252b]'} rounded-[2px] p-2.5 transition-colors`}>
        <div className="break-all font-mono text-[#e6e7e9] select-all leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-xs">
          {value || '<empty>'}
        </div>
        <button
          onClick={handleCopy}
          className="ml-2 text-[#5f6670] hover:text-[#e6e7e9] transition-colors p-1 shrink-0"
          title="Copy value"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
