import React from 'react';
import {
  Layers,
  KeyRound,
  ArrowRightLeft,
  FileSignature,
  Hash,
  Lock,
  Network,
  ShieldAlert,
  Binary
} from 'lucide-react';

export type ActiveModule =
  | 'overview'
  | 'modular'
  | 'rsa'
  | 'dh'
  | 'ecdh'
  | 'ecdsa'
  | 'sha256'
  | 'aes'
  | 'secure-channel'
  | 'tampering';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const sections = [
    {
      category: 'LABORATORY',
      items: [
        { id: 'overview' as ActiveModule, label: 'Overview', icon: Layers }
      ]
    },
    {
      category: 'PRIMITIVES',
      items: [
        { id: 'modular' as ActiveModule, label: 'Modular Arithmetic', icon: Binary },
        { id: 'rsa' as ActiveModule, label: 'RSA Workbench', icon: KeyRound }
      ]
    },
    {
      category: 'KEY EXCHANGE',
      items: [
        { id: 'dh' as ActiveModule, label: 'Diffie-Hellman', icon: ArrowRightLeft },
        { id: 'ecdh' as ActiveModule, label: 'ECDH (P-256)', icon: ArrowRightLeft }
      ]
    },
    {
      category: 'AUTHENTICATION',
      items: [
        { id: 'ecdsa' as ActiveModule, label: 'ECDSA Signatures', icon: FileSignature }
      ]
    },
    {
      category: 'HASHING',
      items: [
        { id: 'sha256' as ActiveModule, label: 'SHA-256 Workbench', icon: Hash }
      ]
    },
    {
      category: 'SYMMETRIC',
      items: [
        { id: 'aes' as ActiveModule, label: 'AES-GCM (AEAD)', icon: Lock }
      ]
    },
    {
      category: 'PROTOCOLS',
      items: [
        { id: 'secure-channel' as ActiveModule, label: 'Secure Channel', icon: Network }
      ]
    },
    {
      category: 'ATTACKS',
      items: [
        { id: 'tampering' as ActiveModule, label: 'Tampering / MitM', icon: ShieldAlert }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/90 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 bg-sky-400 rotate-45 transform"></div>
            <div>
              <div className="font-mono text-sm font-bold tracking-widest text-slate-100 uppercase">CRYPTO LAB</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Research Workbench</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {sections.map((section) => (
            <div key={section.category}>
              <div className="font-mono text-[10px] uppercase font-semibold text-slate-500 px-2 mb-1 tracking-wider">
                {section.category}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectModule(item.id)}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-xs font-mono transition-colors text-left ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80 font-mono text-[10px] text-slate-500">
        <div className="font-semibold text-slate-400">CryptoLab v2.0</div>
        <div>Cryptography Laboratory</div>
      </div>
    </aside>
  );
};
