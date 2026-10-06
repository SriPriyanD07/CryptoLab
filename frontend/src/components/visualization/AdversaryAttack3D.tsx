import React, { useState, useRef, useEffect } from 'react';
import { AlertOctagon, User, Zap, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AdversaryAttack3DProps {
  tamperTarget: 'ciphertext' | 'aad' | 'nonce' | null;
  isTampered: boolean;
  tamperMessage?: string;
  wireCiphertext: string;
  wireTag: string;
  wireNonce: string;
  className?: string;
}

export const AdversaryAttack3D: React.FC<AdversaryAttack3DProps> = ({
  tamperTarget,
  isTampered,
  tamperMessage,
  wireCiphertext,
  wireTag,
  wireNonce,
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
      aria-label="3D Active Adversary Attack Rig"
    >
      {/* Component Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#20252b] mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6e7e9] block">
              3D ACTIVE ADVERSARY MUTATION RIG
            </span>
            <span className="text-[10px] text-[#8b929a] font-normal">
              Physical wire interception & in-flight bit corruption in 3D transport space
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[9.5px]">
          <span className="text-[#5f6670] uppercase">INTERCEPTION:</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-[1px] border ${
              isTampered
                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                : 'bg-[#11151a] text-[#8b929a] border border-[#20252b]'
            }`}
          >
            {isTampered ? `ATTACK ACTIVE [${tamperTarget?.toUpperCase()}]` : 'PASSIVE SNIFFING'}
          </span>
        </div>
      </div>

      {/* 3D Attack Spatial Grid - Generous 380px vertical room */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[380px] bg-[#07090c] border border-[#1a1f26] rounded-[2px] overflow-hidden flex items-center justify-center p-3"
        style={{ perspective: '1100px' }}
      >
        {/* Subtle grid ground */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateZ(${rotate.y}deg) translateZ(-40px)`,
            backgroundImage:
              'linear-gradient(#20252b 1px, transparent 1px), linear-gradient(90deg, #20252b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3D Attack Stage: Alice -> Adversary Interceptor -> Bob */}
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
              <span>1. ALICE (ORIGIN)</span>
            </div>

            <div className="py-2 space-y-1 text-[9px]">
              <div className="text-emerald-400 font-bold">VALID ENCRYPTION</div>
              <div className="text-[8px] text-[#5f6670] uppercase">
                AEAD ENVELOPE GENERATED
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#20252b] text-[8px] text-[#8b929a] font-mono">
              IV: {wireNonce ? wireNonce.slice(0, 10) + '...' : '—'}
            </div>
          </div>

          {/* Central Wire Corridor with Interceptor Node */}
          <div className="grow mx-3 h-full flex flex-col items-center justify-center relative preserve-3d">
            {/* Upper Wire Transit Vectors */}
            <div className="w-full flex items-center justify-between text-[8.5px] text-[#5f6670] px-3 mb-2">
              <span className="flex items-center text-[#8b929a]">
                <span>OUTBOUND</span>
                <ArrowRight className="w-3 h-3 ml-1 text-[#e6e7e9]" />
              </span>

              <span className="text-[8px] px-1.5 py-0.5 bg-[#11151a] border border-[#20252b] text-amber-400 uppercase font-bold tracking-wider">
                UNPROTECTED WIRE PATH
              </span>

              <span className="flex items-center text-[#8b929a]">
                <ArrowRight className="w-3 h-3 mr-1 text-[#e6e7e9]" />
                <span>INBOUND</span>
              </span>
            </div>

            {/* In-Transit Packet & Floating Adversary Node */}
            <div className="flex flex-col items-center space-y-2 z-30">
              {/* Floating Adversary Node (Depth translateZ = 75px) */}
              <div
                className={`w-[220px] rounded-[2px] border p-2.5 transition-all duration-300 text-center shadow-[0_16px_36px_rgba(0,0,0,0.85)] ${
                  isTampered
                    ? 'bg-rose-950/40 border-rose-700 shadow-[0_0_30px_rgba(225,29,72,0.3)]'
                    : 'bg-[#11151a] border-[#20252b]'
                }`}
                style={{
                  transform: isTampered ? 'translateZ(75px) scale(1.03)' : 'translateZ(50px)'
                }}
              >
                <div className="flex items-center justify-center space-x-1.5 text-[9.5px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3" />
                  <span>2. ACTIVE ADVERSARY TAP</span>
                </div>

                {isTampered ? (
                  <div className="space-y-1">
                    <div className="text-[9px] text-rose-300 font-bold flex items-center justify-center space-x-1">
                      <AlertOctagon className="w-3 h-3 text-rose-400" />
                      <span>IN-FLIGHT BIT CORRUPTED</span>
                    </div>
                    <div className="text-[8px] text-[#cbd5e1] font-mono leading-tight bg-[#090b0e] p-1 border border-rose-900/60 rounded-[1px]">
                      Target: [{tamperTarget?.toUpperCase()}] 1-bit mutation
                    </div>
                  </div>
                ) : (
                  <div className="text-[8px] text-[#5f6670] py-1">
                    PASSIVE WIRE TAP // CHOOSE MUTATION VECTOR
                  </div>
                )}
              </div>

              {/* Wire Packet Indicator */}
              <div
                className={`w-[200px] rounded-[2px] border p-2 text-center transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.6)] ${
                  isTampered ? 'bg-[#14080a] border-rose-800' : 'bg-[#090b0e] border-[#20252b]'
                }`}
                style={{
                  transform: 'translateZ(30px)'
                }}
              >
                <div className="text-[8px] text-[#5f6670] uppercase font-bold flex items-center justify-between">
                  <span>WIRE ENVELOPE</span>
                  <span className="font-mono text-emerald-400">TAG: {wireTag ? wireTag.slice(0, 8) + '...' : '—'}</span>
                </div>
                <div
                  className={`font-mono text-[8.5px] truncate mt-0.5 ${
                    isTampered ? 'text-rose-400 font-bold' : 'text-[#cbd5e1]'
                  }`}
                >
                  {wireCiphertext ? wireCiphertext.slice(0, 20) + '...' : '7fb6d932...'}
                </div>
              </div>
            </div>

            {/* Spatial Axis Connector Line */}
            <div className="w-[1px] h-8 bg-[#20252b] mt-2" />
          </div>

          {/* Node 3: Bob Decryptor / Integrity Boundary (Right) */}
          <div
            className={`w-[145px] rounded-[2px] p-2.5 flex flex-col justify-between border shadow-[0_12px_28px_rgba(0,0,0,0.7)] z-20 transition-all ${
              isTampered
                ? 'bg-[#14080a] border-rose-800'
                : 'bg-[#081310] border-emerald-700/80'
            }`}
            style={{
              transform: 'translateZ(30px)'
            }}
          >
            <div className="flex items-center space-x-1.5 border-b border-[#20252b] pb-1.5 text-[9.5px] text-[#e6e7e9] font-bold">
              <User className="w-3 h-3 text-[#8b929a]" />
              <span>3. BOB (RECEIVER)</span>
            </div>

            <div className="py-2 space-y-1 text-[9px]">
              <div className="text-[#5f6670] uppercase text-[8px]">
                GHASH TAG CHECK:
              </div>
              <div>
                {isTampered ? (
                  <span className="text-rose-400 font-bold flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span>FAILED</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>PASSED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#20252b] text-[8px]">
              {isTampered ? (
                <span className="text-rose-400 font-bold">RELEASE BLOCKED</span>
              ) : (
                <span className="text-emerald-400 font-bold">AUTHENTICATED</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attack Pipeline State Sequence */}
      <div className="mt-3 p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] flex items-center justify-between text-[9px]">
        <div className="flex items-center space-x-1.5 text-[#8b929a]">
          <span className="text-[#5f6670]">SEQUENCE:</span>
          <span>CREATED</span>
          <span className="text-[#5f6670]">&rarr;</span>
          <span className={isTampered ? 'text-amber-400 font-bold' : ''}>INTERCEPTED</span>
          <span className="text-[#5f6670]">&rarr;</span>
          <span className={isTampered ? 'text-rose-400 font-bold' : ''}>MUTATED</span>
          <span className="text-[#5f6670]">&rarr;</span>
          <span className={isTampered ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
            {isTampered ? 'GHASH REJECTED' : 'VERIFIED'}
          </span>
        </div>

        {tamperMessage && (
          <span className="text-rose-400 font-mono text-[8.5px]">
            [{tamperMessage}]
          </span>
        )}
      </div>
    </div>
  );
};
