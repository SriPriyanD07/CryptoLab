import { RefreshCw, Activity, Cpu } from 'lucide-react';
import type { ActiveModule } from './Sidebar';

interface TopBarProps {
  activeModule: ActiveModule;
  onReset?: () => void;
}

const moduleNames: Record<ActiveModule, string> = {
  overview: 'LABORATORY OVERVIEW',
  modular: 'MODULAR ARITHMETIC',
  rsa: 'RSA WORKBENCH',
  dh: 'DIFFIE-HELLMAN KEY EXCHANGE',
  ecdh: 'ECDH KEY EXCHANGE',
  ecdsa: 'ECDSA SIGNATURES',
  sha256: 'SHA-256 WORKBENCH',
  aes: 'AES-GCM (AEAD)',
  'secure-channel': 'SECURE CHANNEL PROTOCOL',
  tampering: 'ATTACK & TAMPERING SIMULATION'
};

export const TopBar: React.FC<TopBarProps> = ({ activeModule, onReset }) => {
  return (
    <header className="h-12 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between px-4 shrink-0 font-mono select-none">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-500 font-semibold">CRYPTO LAB</span>
        <span className="text-slate-600">/</span>
        <span className="text-sky-400 font-bold tracking-wider">{moduleNames[activeModule]}</span>
      </div>

      {/* Controls & Engine Status */}
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-[11px]">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>SYSTEM READY</span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>WEB CRYPTO &bull; BIGINT ENGINE</span>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors text-[11px]"
            title="Reset current workbench state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        )}
      </div>
    </header>
  );
};
