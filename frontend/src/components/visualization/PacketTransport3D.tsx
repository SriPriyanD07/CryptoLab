import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, User, Radio, ArrowRight, Shield } from 'lucide-react';

interface PacketTransport3DProps {
  nonceHex: string;
  aadText: string;
  ciphertextHex: string;
  tagHex: string;
  isTransmitted: boolean;
  isTampered: boolean;
  tamperMessage?: string;
  decryptionStatus: 'idle' | 'verified' | 'failed';
  className?: string;
}

export const PacketTransport3D: React.FC<PacketTransport3DProps> = ({
  nonceHex,
  aadText,
  ciphertextHex,
  tagHex,
  isTransmitted,
  isTampered,
  tamperMessage,
  decryptionStatus,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 16, y: -6 });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = 16 - (y / rect.height) * 6;
    const rotY = -6 + (x / rect.width) * 6;
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 16, y: -6 });
  };

  return (
    <div
      className={`bg-[#0d1014] border border-[#20252b] rounded-[2px] p-4 font-mono select-none flex flex-col justify-between ${className}`}
      aria-label="3D Dimensional Secure Channel Wire Transit Rig"
    >
      {/* Component Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#20252b] mb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#8b929a]" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6e7e9] block">
              3D SECURE PACKET TRANSPORT CHANNEL
            </span>
            <span className="text-[10px] text-[#8b929a] font-normal">
              Spatial corridor showing in-transit AEAD wire frame & cryptographic boundary
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[9.5px]">
          <span className="text-[#5f6670] uppercase">DOLEV-YAO MODEL:</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-[1px] border ${
              isTampered
                ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                : 'bg-[#11151a] border-[#20252b] text-[#8b929a]'
            }`}
          >
            {isTampered ? 'ADVERSARY ACTIVE' : 'UNCOMPROMISED WIRE'}
          </span>
        </div>
      </div>

      {/* 3D Wire Corridor Scene - Spacious 380px vertical room */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[380px] bg-[#07090c] border border-[#1a1f26] rounded-[2px] overflow-hidden flex items-center justify-center p-3"
        style={{ perspective: '1100px' }}
      >
        {/* Subtle grid corridor background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateZ(${rotate.y}deg) translateZ(-40px)`,
            backgroundImage:
              'linear-gradient(#20252b 1px, transparent 1px), linear-gradient(90deg, #20252b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3D Isometric Transport Layout: Alice -> Wire Packet -> Bob */}
        <div
          className="relative w-full h-full preserve-3d transition-transform duration-200 ease-out flex items-center justify-between px-3"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
          }}
        >
          {/* Node 1: Alice Originator (Left) */}
          <div
            className="w-[145px] bg-[#0d1014] border border-[#20252b] rounded-[2px] p-2.5 flex flex-col justify-between shadow-[0_12px_28px_rgba(0,0,0,0.7)] z-20"
            style={{
              transform: 'translateZ(30px)'
            }}
          >
            <div className="flex items-center space-x-1.5 border-b border-[#20252b] pb-1.5 text-[9.5px] text-[#e6e7e9] font-bold">
              <User className="w-3 h-3 text-[#8b929a]" />
              <span>ALICE (TRANSMITTER)</span>
            </div>

            <div className="py-2 space-y-1.5 text-[9px]">
              <div className="flex items-center justify-between text-[#8b929a]">
                <span>KEY K:</span>
                <span className="text-emerald-400 font-bold">CONFIDENTIAL</span>
              </div>
              <div className="text-[8px] text-[#5f6670] uppercase">
                AEAD ENCLAVE
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#20252b] text-[8.5px] text-emerald-400 font-semibold flex items-center justify-between">
              <span>CIPHER: AES-GCM</span>
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
            </div>
          </div>

          {/* Central Wire Space & 3D In-Flight Packet */}
          <div className="grow mx-3 h-full flex flex-col items-center justify-center relative preserve-3d">
            {/* Wire Corridor Header Indicator */}
            <div className="w-full flex items-center justify-between text-[8.5px] text-[#5f6670] px-3 mb-2">
              <span className="flex items-center text-[#8b929a]">
                <span>WIRE EMIT</span>
                <ArrowRight className="w-3 h-3 ml-1 text-[#e6e7e9]" />
              </span>

              <span className="text-[8px] px-1.5 py-0.5 bg-[#11151a] border border-[#20252b] text-[#8b929a] uppercase font-bold tracking-wider">
                PHYSICAL WIRE CHANNEL
              </span>

              <span className="flex items-center text-[#8b929a]">
                <ArrowRight className="w-3 h-3 mr-1 text-[#e6e7e9]" />
                <span>DELIVERY</span>
              </span>
            </div>

            {/* In-Flight 3D AEAD Packet Frame */}
            <div
              className={`relative z-30 w-[240px] rounded-[2px] border transition-all duration-300 p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] ${
                !isTransmitted
                  ? 'bg-[#11151a]/90 border-[#20252b] opacity-60'
                  : isTampered
                  ? 'bg-[#14080a] border-rose-800 shadow-[0_0_25px_rgba(225,29,72,0.25)]'
                  : decryptionStatus === 'verified'
                  ? 'bg-[#081310] border-emerald-700/80 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'bg-[#11151a] border-[#e6e7e9]'
              }`}
              style={{
                transform: 'translateZ(65px)'
              }}
            >
              {/* Packet Header */}
              <div className="flex items-center justify-between border-b border-[#20252b] pb-1 mb-1.5 text-[9.5px]">
                <span className="font-bold text-[#e6e7e9] tracking-wider uppercase">
                  AEAD WIRE FRAME
                </span>

                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[1px] ${
                    isTampered
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : decryptionStatus === 'verified'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-[#181d24] text-[#cbd5e1] border border-[#20252b]'
                  }`}
                >
                  {isTampered ? 'TAMPERED IN-FLIGHT' : isTransmitted ? 'EN ROUTE' : 'READY'}
                </span>
              </div>

              {/* Dimensional Packet Fields */}
              <div className="space-y-1 text-[8.5px]">
                <div className="flex items-center justify-between text-[#8b929a]">
                  <span>NONCE (96-bit):</span>
                  <span className="font-mono text-[#cbd5e1] truncate max-w-[125px]">
                    {nonceHex ? nonceHex.slice(0, 16) + '...' : 'ad53929a...'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#8b929a]">
                  <span>AAD HEADER:</span>
                  <span className="font-mono text-[#cbd5e1] truncate max-w-[125px]">
                    {aadText ? aadText.slice(0, 18) + '...' : 'transaction-id...'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#8b929a]">
                  <span>CIPHERTEXT:</span>
                  <span
                    className={`font-mono truncate max-w-[125px] ${
                      isTampered ? 'text-rose-400 font-bold' : 'text-[#cbd5e1]'
                    }`}
                  >
                    {ciphertextHex ? ciphertextHex.slice(0, 16) + '...' : 'd16f6d9b...'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#8b929a]">
                  <span>GHASH TAG (128-bit):</span>
                  <span className="font-mono text-emerald-400 font-bold truncate max-w-[125px]">
                    {tagHex ? tagHex.slice(0, 16) + '...' : '0fe0414b...'}
                  </span>
                </div>
              </div>

              {/* Adversary Observation Banner */}
              {isTampered && (
                <div className="mt-2 pt-1 border-t border-rose-900/60 flex items-center justify-between text-[8px] text-rose-300 font-bold">
                  <div className="flex items-center space-x-1">
                    <AlertOctagon className="w-2.5 h-2.5 text-rose-400" />
                    <span>MITM BIT-FLIP DETECTED</span>
                  </div>
                  <span>1 NIBBLE ALTERED</span>
                </div>
              )}
            </div>

            {/* Spatial Axis Connector Line */}
            <div className="w-[1px] h-8 bg-[#20252b] mt-2" />
          </div>

          {/* Node 2: Bob Receiver (Right) */}
          <div
            className={`w-[145px] rounded-[2px] p-2.5 flex flex-col justify-between border shadow-[0_12px_28px_rgba(0,0,0,0.7)] z-20 transition-all ${
              decryptionStatus === 'verified'
                ? 'bg-[#081310] border-emerald-600/80'
                : decryptionStatus === 'failed'
                ? 'bg-[#14080a] border-rose-800'
                : 'bg-[#0d1014] border-[#20252b]'
            }`}
            style={{
              transform: 'translateZ(30px)'
            }}
          >
            <div className="flex items-center space-x-1.5 border-b border-[#20252b] pb-1.5 text-[9.5px] text-[#e6e7e9] font-bold">
              <User className="w-3 h-3 text-[#8b929a]" />
              <span>BOB (RECIPIENT)</span>
            </div>

            <div className="py-2 space-y-1.5 text-[9px]">
              <div className="flex items-center justify-between text-[#8b929a]">
                <span>KEY K:</span>
                <span className="text-emerald-400 font-bold">CONFIDENTIAL</span>
              </div>
              <div className="text-[8px] text-[#5f6670] uppercase">
                AUTHENTICATION CHECK
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#20252b] text-[8.5px]">
              {decryptionStatus === 'verified' ? (
                <span className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>VERIFIED</span>
                  <ShieldCheck className="w-3 h-3" />
                </span>
              ) : decryptionStatus === 'failed' ? (
                <span className="text-rose-400 font-bold flex items-center justify-between">
                  <span>REJECTED</span>
                  <ShieldAlert className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[#8b929a]">AWAITING WIRE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wire Verification Footer */}
      <div className="mt-3 p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] flex items-center justify-between text-[9.5px]">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[#8b929a]">WIRE INVARIANT:</span>
          <span className={`font-semibold ${isTampered ? 'text-rose-400' : 'text-[#e6e7e9]'}`}>
            {isTampered ? 'GHASH TAG MISMATCH — PLAINTEXT BLOCKED' : 'AEAD CRYPTOGRAPHIC INTEGRITY ENFORCED'}
          </span>
        </div>

        {tamperMessage && (
          <span className="text-rose-400 font-mono text-[9px]">
            [{tamperMessage}]
          </span>
        )}
      </div>
    </div>
  );
};
