import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Lock, ArrowRight, Shield, User, Key } from 'lucide-react';

interface EcdhConvergence3DProps {
  alicePublicHex: string;
  bobPublicHex: string;
  sharedSecretHex: string;
  sessionKeyHex: string;
  secretsMatch: boolean;
  className?: string;
}

export const EcdhConvergence3D: React.FC<EcdhConvergence3DProps> = ({
  alicePublicHex,
  bobPublicHex,
  sharedSecretHex,
  sessionKeyHex,
  secretsMatch,
  className = ''
}) => {
  const [activeStage, setActiveStage] = useState<'all' | 'endpoints' | 'transit' | 'convergence' | 'kdf'>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 18, y: -8 });
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

    const rotX = 18 - (y / rect.height) * 6;
    const rotY = -8 + (x / rect.width) * 6;
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 18, y: -8 });
  };

  return (
    <div
      className={`bg-[#0d1014] border border-[#20252b] rounded-[2px] p-4 font-mono select-none flex flex-col justify-between ${className}`}
      aria-label="3D ECDH Protocol State Convergence Instrument"
    >
      {/* Instrument Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#20252b] mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#8b929a]" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e6e7e9] block">
              3D PROTOCOL CONVERGENCE SPACE
            </span>
            <span className="text-[10px] text-[#8b929a] font-normal">
              Spatial representation of dual scalar multiplication & shared secret derivation
            </span>
          </div>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex items-center space-x-1 text-[9.5px]">
          <button
            onClick={() => setActiveStage('all')}
            className={`px-2 py-0.5 rounded-[2px] border transition-colors ${
              activeStage === 'all'
                ? 'bg-[#181d24] border-[#e6e7e9] text-white font-bold'
                : 'bg-[#090b0e] border-[#20252b] text-[#8b929a] hover:border-[#8b929a]'
            }`}
          >
            FULL PROTOCOL
          </button>
          <button
            onClick={() => setActiveStage('endpoints')}
            className={`px-2 py-0.5 rounded-[2px] border transition-colors ${
              activeStage === 'endpoints'
                ? 'bg-[#181d24] border-[#e6e7e9] text-white font-bold'
                : 'bg-[#090b0e] border-[#20252b] text-[#8b929a] hover:border-[#8b929a]'
            }`}
          >
            ENDPOINTS
          </button>
          <button
            onClick={() => setActiveStage('convergence')}
            className={`px-2 py-0.5 rounded-[2px] border transition-colors ${
              activeStage === 'convergence'
                ? 'bg-[#181d24] border-[#e6e7e9] text-white font-bold'
                : 'bg-[#090b0e] border-[#20252b] text-[#8b929a] hover:border-[#8b929a]'
            }`}
          >
            CONVERGENCE
          </button>
          <button
            onClick={() => setActiveStage('kdf')}
            className={`px-2 py-0.5 rounded-[2px] border transition-colors ${
              activeStage === 'kdf'
                ? 'bg-[#181d24] border-[#e6e7e9] text-white font-bold'
                : 'bg-[#090b0e] border-[#20252b] text-[#8b929a] hover:border-[#8b929a]'
            }`}
          >
            HKDF
          </button>
        </div>
      </div>

      {/* 3D Spatial Rig (Isometric Perspective) - Generous 380px vertical room */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[380px] bg-[#07090c] border border-[#1a1f26] rounded-[2px] overflow-hidden flex items-center justify-center p-3"
        style={{ perspective: '1100px' }}
      >
        {/* Spatial Depth Grid Ground */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateZ(${rotate.y}deg) translateZ(-40px)`,
            backgroundImage:
              'linear-gradient(#20252b 1px, transparent 1px), linear-gradient(90deg, #20252b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3D Isometric Protocol Planes */}
        <div
          className="relative w-full h-full preserve-3d transition-transform duration-200 ease-out flex items-center justify-between px-3"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
          }}
        >
          {/* Plane 1: Alice Endpoint (Left / Depth) */}
          <div
            className={`w-[145px] bg-[#0d1014] border rounded-[2px] p-2.5 flex flex-col justify-between shadow-[0_12px_28px_rgba(0,0,0,0.7)] z-20 transition-all ${
              activeStage === 'endpoints' || activeStage === 'all'
                ? 'border-[#e6e7e9] opacity-100'
                : 'border-[#20252b] opacity-50'
            }`}
            style={{
              transform: 'translateZ(30px)'
            }}
          >
            <div className="flex items-center space-x-1.5 border-b border-[#20252b] pb-1.5 text-[9.5px] text-[#e6e7e9] font-bold">
              <User className="w-3 h-3 text-[#8b929a]" />
              <span>ALICE (INITIATOR)</span>
            </div>

            <div className="py-2 space-y-1.5 text-[9px]">
              <div className="flex items-center justify-between text-[#8b929a]">
                <span>SCALAR d_A:</span>
                <span className="text-emerald-400 font-bold flex items-center">
                  <Lock className="w-2.5 h-2.5 mr-0.5" /> SECRET
                </span>
              </div>
              <div className="text-[8.5px] text-[#8b929a] font-mono bg-[#090b0e] p-1 border border-[#20252b] rounded-[1px]">
                Q_A = d_A &times; G
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#20252b]">
              <span className="text-[8px] text-[#5f6670] uppercase block">Public Point Q_A:</span>
              <div className="text-[8.5px] text-[#e6e7e9] truncate font-mono mt-0.5">
                {alicePublicHex ? alicePublicHex.slice(0, 16) + '...' : '0473d1...'}
              </div>
            </div>
          </div>

          {/* Central 3D Spatial Wire & Convergence Node */}
          <div className="grow mx-3 h-full flex flex-col items-center justify-center relative preserve-3d">
            {/* Upper Wire Transit Vectors */}
            <div className="w-full flex items-center justify-between text-[8.5px] text-[#5f6670] px-3 mb-3">
              <span className="flex items-center text-[#8b929a] font-semibold">
                <span>PUBLIC Q_A</span>
                <ArrowRight className="w-3 h-3 ml-1 text-[#e6e7e9]" />
              </span>

              <span className="text-[8px] px-1.5 py-0.5 bg-[#11151a] border border-[#20252b] text-[#8b929a] uppercase font-bold tracking-wider">
                PUBLIC WIRE
              </span>

              <span className="flex items-center text-[#8b929a] font-semibold">
                <ArrowRight className="w-3 h-3 mr-1 text-[#e6e7e9] rotate-180" />
                <span>PUBLIC Q_B</span>
              </span>
            </div>

            {/* Central Convergence Dimensional Node (Depth TranslateZ = 65px) */}
            <div
              className={`w-[220px] rounded-[2px] border transition-all duration-300 p-2.5 text-center shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-30 ${
                secretsMatch
                  ? 'bg-[#11151a] border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'bg-[#11151a] border-[#20252b]'
              }`}
              style={{
                transform: 'translateZ(65px)'
              }}
            >
              <div className="text-[9.5px] uppercase font-bold text-[#8b929a] tracking-wider mb-1 flex items-center justify-center space-x-1">
                <span>SHARED POINT CONVERGENCE</span>
                {secretsMatch && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>

              <div className="bg-[#090b0e] border border-[#20252b] rounded-[1px] p-1.5 font-mono text-[9px] text-[#e6e7e9] truncate mb-1.5 select-all">
                {sharedSecretHex ? sharedSecretHex.slice(0, 26) + '...' : '369b10a011601ea29315...'}
              </div>

              <div className="text-[8px] text-[#8b929a] leading-tight mb-2 font-mono">
                S = d_A &times; Q_B = d_B &times; Q_A
              </div>

              {/* Lower Derived Session Key Layer (HKDF) */}
              <div
                className={`pt-2 border-t flex items-center justify-between text-[8.5px] ${
                  activeStage === 'kdf' || activeStage === 'all'
                    ? 'border-[#20252b] opacity-100'
                    : 'border-[#1a1f26] opacity-60'
                }`}
              >
                <span className="text-[#8b929a] flex items-center font-semibold">
                  <Key className="w-2.5 h-2.5 mr-1 text-[#e6e7e9]" />
                  <span>SESSION KEY:</span>
                </span>
                <span className="text-emerald-400 font-bold truncate max-w-[105px] font-mono">
                  {sessionKeyHex ? sessionKeyHex.slice(0, 12) + '...' : 'c8cd2c9a...'}
                </span>
              </div>
            </div>

            {/* Spatial Axis Connector Line */}
            <div className="w-[1px] h-8 bg-[#20252b] mt-2" />
          </div>

          {/* Plane 2: Bob Endpoint (Right / Depth) */}
          <div
            className={`w-[145px] bg-[#0d1014] border rounded-[2px] p-2.5 flex flex-col justify-between shadow-[0_12px_28px_rgba(0,0,0,0.7)] z-20 transition-all ${
              activeStage === 'endpoints' || activeStage === 'all'
                ? 'border-[#e6e7e9] opacity-100'
                : 'border-[#20252b] opacity-50'
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
                <span>SCALAR d_B:</span>
                <span className="text-emerald-400 font-bold flex items-center">
                  <Lock className="w-2.5 h-2.5 mr-0.5" /> SECRET
                </span>
              </div>
              <div className="text-[8.5px] text-[#8b929a] font-mono bg-[#090b0e] p-1 border border-[#20252b] rounded-[1px]">
                Q_B = d_B &times; G
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#20252b]">
              <span className="text-[8px] text-[#5f6670] uppercase block">Public Point Q_B:</span>
              <div className="text-[8.5px] text-[#e6e7e9] truncate font-mono mt-0.5">
                {bobPublicHex ? bobPublicHex.slice(0, 16) + '...' : '042d03...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensional Convergence Status Bar */}
      <div className="mt-3 p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] flex items-center justify-between text-[9.5px]">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[#8b929a]">CONVERGENCE INVARIANT:</span>
          <span className="text-[#e6e7e9] font-semibold">
            {secretsMatch ? 'BIT-LEVEL IDENTICAL 256-BIT SHARED SECRET ESTABLISHED' : 'PENDING COMPUTATION'}
          </span>
        </div>

        <span className="text-[#5f6670] font-mono">
          DEPTH: 5 PROTOCOL LAYERS
        </span>
      </div>
    </div>
  );
};
