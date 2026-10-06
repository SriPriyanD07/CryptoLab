import React from 'react';
import type { ActiveModule } from '../../components/layout/Sidebar';
import { CryptographicArchitecture3D } from '../../components/visualization/CryptographicArchitecture3D';
import {
  Binary,
  KeyRound,
  ArrowRightLeft,
  FileSignature,
  Hash,
  Lock,
  Network,
  ShieldAlert,
  Activity
} from 'lucide-react';

interface OverviewWorkbenchProps {
  onNavigate: (module: ActiveModule) => void;
}

interface ExperimentTile {
  id: ActiveModule;
  code: string;
  name: string;
  purpose: string;
  standard: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const OverviewWorkbench: React.FC<OverviewWorkbenchProps> = ({ onNavigate }) => {
  const experiments: ExperimentTile[] = [
    {
      id: 'modular',
      code: 'MATH-01',
      name: 'MODULAR ARITHMETIC',
      purpose: 'FINITE FIELDS & INVERSION',
      standard: 'EUCLIDEAN / BÉZOUT',
      status: 'READY',
      icon: Binary
    },
    {
      id: 'rsa',
      code: 'ASYM-01',
      name: 'RSA CRYPTOSYSTEM',
      purpose: 'FACTORIZATION ASYMMETRY',
      standard: 'PKCS#1 v2.2',
      status: 'READY',
      icon: KeyRound
    },
    {
      id: 'dh',
      code: 'KEX-01',
      name: 'DIFFIE-HELLMAN (FFDH)',
      purpose: 'DISCRETE LOG KEY AGREEMENT',
      standard: 'RFC 3526',
      status: 'READY',
      icon: ArrowRightLeft
    },
    {
      id: 'ecdh',
      code: 'KEX-02',
      name: 'ECDH (P-256)',
      purpose: 'ELLIPTIC CURVE POINT AGREEMENT',
      standard: 'NIST SP 800-56A',
      status: 'READY',
      icon: ArrowRightLeft
    },
    {
      id: 'ecdsa',
      code: 'AUTH-01',
      name: 'ECDSA SIGNATURES',
      purpose: 'DIGITAL SIGNATURE & INTEGRITY',
      standard: 'FIPS 186-4',
      status: 'READY',
      icon: FileSignature
    },
    {
      id: 'sha256',
      code: 'HASH-01',
      name: 'SHA-256 WORKBENCH',
      purpose: 'ONE-WAY DIGEST & AVALANCHE',
      standard: 'FIPS 180-4',
      status: 'READY',
      icon: Hash
    },
    {
      id: 'aes',
      code: 'AEAD-01',
      name: 'AES-256-GCM',
      purpose: 'AUTHENTICATED ENCRYPTION (AEAD)',
      standard: 'NIST SP 800-38D',
      status: 'READY',
      icon: Lock
    },
    {
      id: 'secure-channel',
      code: 'PROTO-01',
      name: 'SECURE CHANNEL',
      purpose: 'FULL PROTOCOL PIPELINE (TLS-LIKE)',
      standard: 'ECDH + HKDF + GCM',
      status: 'READY',
      icon: Network
    },
    {
      id: 'tampering',
      code: 'ATTACK-01',
      name: 'TAMPERING STUDIO',
      purpose: 'ACTIVE ADVERSARY WIRE INTERCEPT',
      standard: 'DOLEV-YAO MODEL',
      status: 'READY',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Laboratory Command Center Header */}
      <div className="border border-[#20252b] bg-[#0d1014] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#e6e7e9] rotate-45 transform shrink-0"></span>
            <h1 className="text-sm font-bold tracking-widest text-[#e6e7e9] uppercase">
              CRYPTOGRAPHY RESEARCH WORKSTATION
            </h1>
          </div>
          <p className="text-[11px] text-[#8b929a] mt-0.5 tracking-wide">
            Interactive protocol experimentation environment. Intermediate state inspection & adversary failure analysis.
          </p>
        </div>

        {/* Global Telemetry Rail */}
        <div className="flex items-center space-x-2 text-[10px]">
          <div className="px-2 py-1 rounded-[2px] bg-[#11151a] border border-[#20252b] flex items-center space-x-1.5 text-[#8b929a]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[#5f6670]">ENGINE:</span>
            <span className="text-[#e6e7e9]">WEB CRYPTO</span>
          </div>

          <div className="px-2 py-1 rounded-[2px] bg-[#11151a] border border-[#20252b] flex items-center space-x-1.5 text-[#8b929a]">
            <Activity className="w-3 h-3 text-[#8b929a]" />
            <span className="text-[#5f6670]">TESTS:</span>
            <span className="text-emerald-400 font-semibold">24 / 24 PASS</span>
          </div>
        </div>
      </div>

      {/* 3D CRYPTOGRAPHIC ARCHITECTURE STACK CENTERPIECE */}
      <CryptographicArchitecture3D onNavigate={onNavigate} />

      {/* Experiments Section Header */}
      <div className="mt-4">
        <div className="flex items-center justify-between pb-1.5 mb-3 border-b border-[#20252b]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6e7e9]">
            RESEARCH EXPERIMENTS & WORKBENCHES
          </span>
          <span className="text-[9px] text-[#5f6670]">[9 ACTIVE MODULES]</span>
        </div>

        {/* Technical Experiment Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {experiments.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="p-2.5 rounded-[2px] bg-[#0d1014] border border-[#20252b] hover:border-[#8b929a] hover:bg-[#11151a] transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] text-[#5f6670] mb-1">
                    <span className="font-semibold text-[#8b929a]">{tile.code}</span>
                    <span className="px-1.5 py-0.2 rounded-[1px] bg-[#090b0e] border border-[#20252b] text-emerald-400 font-semibold">
                      {tile.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Icon className="w-3.5 h-3.5 text-[#8b929a] group-hover:text-[#e6e7e9] transition-colors shrink-0" />
                    <span className="text-xs font-bold text-[#e6e7e9] group-hover:text-white tracking-wide uppercase transition-colors">
                      {tile.name}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#8b929a] mt-1 uppercase font-medium">
                    {tile.purpose}
                  </div>
                </div>

                <div className="mt-3 pt-1.5 border-t border-[#181d24] flex items-center justify-between text-[9px] text-[#5f6670]">
                  <span>STANDARD: {tile.standard}</span>
                  <span className="text-[#e6e7e9] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    OPEN &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
