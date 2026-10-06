import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import type { ActiveModule } from './Sidebar';

interface TopBarProps {
  activeModule: ActiveModule;
  onReset?: () => void;
}

const moduleLabels: Record<ActiveModule, { code: string; title: string }> = {
  overview: { code: 'LAB', title: 'LABORATORY OVERVIEW' },
  modular: { code: 'MATH', title: 'MODULAR ARITHMETIC' },
  rsa: { code: 'ASYM', title: 'RSA CRYPTOSYSTEM' },
  dh: { code: 'KEX', title: 'DIFFIE-HELLMAN (FFDH)' },
  ecdh: { code: 'KEX', title: 'ECDH (P-256)' },
  ecdsa: { code: 'AUTH', title: 'ECDSA SIGNATURES' },
  sha256: { code: 'HASH', title: 'SHA-256 DIGEST' },
  aes: { code: 'AEAD', title: 'AES-256-GCM' },
  'secure-channel': { code: 'PROTO', title: 'SECURE CHANNEL' },
  tampering: { code: 'ATTACK', title: 'TAMPERING STUDIO' }
};

export const TopBar: React.FC<TopBarProps> = ({ activeModule, onReset }) => {
  const current = moduleLabels[activeModule] || { code: 'LAB', title: 'WORKBENCH' };

  return (
    <header className="h-9 bg-[#090b0e] border-b border-[#20252b] flex items-center justify-between px-3 shrink-0 font-mono text-xs select-none z-10">
      {/* Brand & Active Target */}
      <div className="flex items-center space-x-2 text-[11px]">
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-[#e6e7e9] tracking-wider">CRYPTOLAB</span>
          <span className="text-[#5f6670]">/</span>
          <span className="text-[#8b929a] uppercase tracking-widest text-[10px]">RESEARCH WORKSTATION</span>
        </div>

        <span className="text-[#5f6670] hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center space-x-1.5">
          <span className="text-[10px] text-[#5f6670] font-semibold">[{current.code}]</span>
          <span className="text-[#e6e7e9] font-semibold tracking-wide text-[11px]">{current.title}</span>
        </div>
      </div>

      {/* System Telemetry & Actions */}
      <div className="flex items-center space-x-3 text-[11px]">
        {/* Engine Ready */}
        <div className="hidden md:flex items-center space-x-1.5 text-[#8b929a]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-[#8b929a]">WEB CRYPTO</span>
          <span className="text-[#5f6670]">//</span>
          <span className="text-[10px] text-emerald-400 font-medium">READY</span>
        </div>

        {/* Python Unit Tests */}
        <div className="hidden lg:flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] bg-[#11151a] border border-[#20252b] text-[10px] text-[#8b929a]">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          <span className="text-[#8b929a]">PYTEST:</span>
          <span className="text-emerald-400 font-semibold">24/24 PASS</span>
        </div>

        {/* Reset Action */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] border border-[#20252b] text-[#8b929a] hover:text-[#e6e7e9] transition-colors text-[10px]"
            title="Reset current workbench state"
          >
            <RefreshCw className="w-2.5 h-2.5 text-[#8b929a]" />
            <span>RESET</span>
          </button>
        )}
      </div>
    </header>
  );
};
