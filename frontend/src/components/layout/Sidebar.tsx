import React from 'react';
import type { LucideIcon } from 'lucide-react';
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

interface NavItem {
  id: ActiveModule;
  label: string;
  icon?: LucideIcon;
}

interface NavSection {
  category: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const sections: NavSection[] = [
    {
      category: 'LABORATORY',
      items: [
        { id: 'overview', label: 'Overview', icon: Layers },
        { id: 'modular', label: 'Modular Arithmetic', icon: Binary }
      ]
    },
    {
      category: 'PUBLIC-KEY',
      items: [
        { id: 'rsa', label: 'RSA', icon: KeyRound },
        { id: 'dh', label: 'Diffie-Hellman', icon: ArrowRightLeft },
        { id: 'ecdh', label: 'ECDH (P-256)', icon: ArrowRightLeft },
        { id: 'ecdsa', label: 'ECDSA', icon: FileSignature }
      ]
    },
    {
      category: 'PRIMITIVES',
      items: [
        { id: 'sha256', label: 'SHA-256', icon: Hash },
        { id: 'aes', label: 'AES-GCM', icon: Lock }
      ]
    },
    {
      category: 'PROTOCOLS',
      items: [
        { id: 'secure-channel', label: 'Secure Channel', icon: Network },
        { id: 'tampering', label: 'Tampering Studio', icon: ShieldAlert }
      ]
    }
  ];

  return (
    <aside className="w-48 bg-[#090b0e] border-r border-[#20252b] flex flex-col justify-between shrink-0 select-none font-mono z-10">
      <div>
        {/* Brand header */}
        <div className="px-3 py-2.5 border-b border-[#20252b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#e6e7e9] rotate-45 transform shrink-0"></span>
            <div className="text-[11px] font-bold tracking-wider text-[#e6e7e9]">CRYPTOLAB</div>
          </div>
          <span className="text-[9px] px-1 py-0.2 bg-[#11151a] text-[#8b929a] border border-[#20252b] rounded-[2px]">
            v2.0
          </span>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-170px)]">
          {sections.map((section) => (
            <div key={section.category}>
              <div className="text-[9px] uppercase font-semibold text-[#5f6670] px-1.5 mb-0.5 tracking-wider">
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
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] text-[11px] transition-colors text-left ${
                        isActive
                          ? 'bg-[#161a20] text-[#f3f4f6] font-semibold border-l-2 border-[#e6e7e9] pl-1.5'
                          : 'text-[#8b929a] hover:text-[#e6e7e9] hover:bg-[#11151a] border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {Icon && <Icon className={`w-3 h-3 shrink-0 ${isActive ? 'text-[#e6e7e9]' : 'text-[#5f6670]'}`} />}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Technical telemetry footer */}
      <div className="p-2.5 border-t border-[#20252b] bg-[#050607] space-y-2 text-[10px]">
        <div>
          <div className="text-[#5f6670] text-[9px] uppercase font-semibold">ENGINE</div>
          <div className="text-[#8b929a] flex items-center justify-between">
            <span>Web Crypto</span>
            <span className="text-emerald-400 font-medium">READY</span>
          </div>
        </div>

        <div>
          <div className="text-[#5f6670] text-[9px] uppercase font-semibold">PYTHON TESTS</div>
          <div className="text-[#8b929a] flex items-center justify-between">
            <span>Test Suite</span>
            <span className="text-emerald-400 font-semibold">24 / 24 PASS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
