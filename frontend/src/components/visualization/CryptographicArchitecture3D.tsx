import React, { useState, useRef, useEffect } from 'react';
import type { ActiveModule } from '../layout/Sidebar';
import { Layers, ChevronRight, Lock, Binary, KeyRound, ArrowRightLeft, Hash, Network } from 'lucide-react';

interface LayerItem {
  level: number;
  moduleId: ActiveModule;
  code: string;
  title: string;
  subtitle: string;
  standard: string;
  primitives: string;
  icon: React.ComponentType<{ className?: string }>;
  zOffset: number; // translateZ centered around origin
}

const ARCH_LAYERS: LayerItem[] = [
  {
    level: 5,
    moduleId: 'secure-channel',
    code: 'PROTO-01',
    title: 'SECURE CHANNEL PIPELINE',
    subtitle: 'End-to-end transport // Ephemeral handshake + AEAD wire transit',
    standard: 'TLS 1.3 / RFC 8446',
    primitives: 'ECDH P-256 + HKDF-SHA256 + AES-256-GCM',
    icon: Network,
    zOffset: 120
  },
  {
    level: 4,
    moduleId: 'aes',
    code: 'AEAD-01',
    title: 'AUTHENTICATED ENCRYPTION',
    subtitle: 'AES-256-GCM // CTR confidentiality + GHASH polynomial integrity tag',
    standard: 'NIST SP 800-38D',
    primitives: 'AES-256 Cipher + GHASH Galois Field GMAC',
    icon: Lock,
    zOffset: 72
  },
  {
    level: 3,
    moduleId: 'sha256',
    code: 'KDF-01',
    title: 'KEY DERIVATION (HKDF)',
    subtitle: 'HKDF-SHA256 // Extract-and-expand pseudorandom session keying',
    standard: 'RFC 5869 / FIPS 180-4',
    primitives: 'HMAC-SHA256 PRF + Compression Function',
    icon: Hash,
    zOffset: 24
  },
  {
    level: 2,
    moduleId: 'ecdh',
    code: 'KEX-02',
    title: 'KEY AGREEMENT (ECDH)',
    subtitle: 'NIST P-256 // Ephemeral point scalar multiplication on prime curve',
    standard: 'NIST SP 800-56A',
    primitives: 'SECP256R1 Point Multiplication d · Q',
    icon: ArrowRightLeft,
    zOffset: -24
  },
  {
    level: 1,
    moduleId: 'rsa',
    code: 'ASYM-01',
    title: 'PUBLIC-KEY CRYPTOGRAPHY',
    subtitle: 'RSA & FFDH // Trapdoor permutations & discrete logarithm hardness',
    standard: 'PKCS#1 / RFC 3526',
    primitives: 'Euler Totient Asymmetry & Modular Exponentiation',
    icon: KeyRound,
    zOffset: -72
  },
  {
    level: 0,
    moduleId: 'modular',
    code: 'MATH-01',
    title: 'FINITE FIELD MATHEMATICS',
    subtitle: 'Modular arithmetic ℤ_n // Euclidean GCD & Bézout modular inversion',
    standard: 'ALGEBRAIC FOUNDATION',
    primitives: 'Extended Euclidean Algorithm & Group Theory',
    icon: Binary,
    zOffset: -120
  }
];

interface CryptographicArchitecture3DProps {
  onNavigate: (module: ActiveModule) => void;
}

export const CryptographicArchitecture3D: React.FC<CryptographicArchitecture3DProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 46, y: -20 });
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(5);
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
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;  // -0.5 to 0.5

    // Subtle pointer parallax (±4° max, no continuous spinning)
    const rotX = 46 - y * 8;
    const rotY = -20 + x * 8;
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 46, y: -20 });
    setHoveredLevel(null);
  };

  const activeLayer = ARCH_LAYERS.find(
    (l) => l.level === (hoveredLevel !== null ? hoveredLevel : selectedLevel)
  ) || ARCH_LAYERS[0];

  return (
    <div className="relative font-mono select-none w-full">
      {/* Lightweight Workspace Section Label & Minimal Floating Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 gap-2">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-4 h-4 text-[#8b929a] shrink-0" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#e6e7e9]">
              3D CRYPTOGRAPHIC ARCHITECTURE
            </h2>
            <p className="text-[10px] text-[#8b929a] font-normal">
              Dimensional dependency hierarchy // Subsystem layers translate from algebraic foundations to authenticated transport
            </p>
          </div>
        </div>

        {/* Minimal Floating Layer Level Control Strip */}
        <div className="flex items-center space-x-1 bg-[#090b0e]/80 border border-[#20252b] p-0.5 rounded-[2px] backdrop-blur-sm self-start sm:self-auto">
          {ARCH_LAYERS.map((layer) => {
            const isCurrent = (hoveredLevel !== null ? hoveredLevel : selectedLevel) === layer.level;
            return (
              <button
                key={layer.level}
                onClick={() => setSelectedLevel(layer.level)}
                onMouseEnter={() => setHoveredLevel(layer.level)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-[2px] border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#181d24] border-[#e6e7e9] text-white shadow-sm'
                    : 'bg-[#090b0e] border-transparent text-[#8b929a] hover:border-[#8b929a] hover:text-[#e6e7e9]'
                }`}
                title={`Select Layer ${layer.level}: ${layer.title}`}
              >
                L{layer.level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Scene - Pure Transparent Workspace Surface (No Surrounding Card, No Black Rectangle) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[520px] flex items-center justify-center overflow-visible bg-transparent"
        style={{ perspective: '1300px' }}
      >
        {/* Subtle grid ground plane floating in workspace depth */}
        <div
          className="absolute w-[840px] h-[840px] pointer-events-none opacity-15"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateZ(${rotate.y}deg) translateY(-25px) translateZ(-160px)`,
            backgroundImage:
              'linear-gradient(#303844 1px, transparent 1px), linear-gradient(90deg, #303844 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* 4 Corner Vertical Guide Spines matching expanded width */}
        <div
          className="absolute w-[680px] sm:w-[720px] md:w-[760px] h-[190px] pointer-events-none preserve-3d"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateZ(${rotate.y}deg) translateY(-25px)`
          }}
        >
          <div
            className="absolute top-0 left-0 w-[1px] h-[280px] bg-[#20252b]/60"
            style={{ transform: 'translateZ(-140px) translateY(-20px)' }}
          />
          <div
            className="absolute top-0 right-0 w-[1px] h-[280px] bg-[#20252b]/60"
            style={{ transform: 'translateZ(-140px) translateY(-20px)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[1px] h-[280px] bg-[#20252b]/60"
            style={{ transform: 'translateZ(-140px) translateY(-20px)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-[1px] h-[280px] bg-[#20252b]/60"
            style={{ transform: 'translateZ(-140px) translateY(-20px)' }}
          />
        </div>

        {/* Substantially Scaled 3D Layer Stack occupying 70-80% workspace width */}
        <div
          className="relative w-[680px] sm:w-[720px] md:w-[760px] h-[190px] preserve-3d transition-transform duration-200 ease-out z-10"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateZ(${rotate.y}deg) translateY(-25px)`
          }}
        >
          {ARCH_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isHovered = hoveredLevel === layer.level;
            const isSelected = selectedLevel === layer.level;
            const isTarget = isHovered || (hoveredLevel === null && isSelected);
            // Selected layer steps forward by +55px in depth, others recede
            const elevationZ = isTarget ? layer.zOffset + 55 : layer.zOffset;
            const opacity = isTarget ? 1 : 0.60;

            return (
              <div
                key={layer.level}
                onClick={() => setSelectedLevel(layer.level)}
                onMouseEnter={() => setHoveredLevel(layer.level)}
                className={`absolute inset-0 rounded-[2px] border transition-all duration-300 p-3.5 flex flex-col justify-between cursor-pointer ${
                  isTarget
                    ? 'bg-[#12161d]/95 border-[#e6e7e9] shadow-[0_20px_45px_rgba(0,0,0,0.9)] ring-1 ring-[#e6e7e9]/20 z-20'
                    : 'bg-[#0a0d11]/90 border-[#1c222b] hover:border-[#8b929a] shadow-[0_10px_25px_rgba(0,0,0,0.6)] z-10'
                }`}
                style={{
                  transform: `translateZ(${elevationZ}px)`,
                  opacity,
                  backdropFilter: 'blur(4px)'
                }}
              >
                {/* Layer Header */}
                <div className="flex items-center justify-between border-b border-[#20252b]/80 pb-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[1px] border font-mono ${
                        isTarget
                          ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300'
                          : 'bg-[#090b0e] border-[#20252b] text-[#5f6670]'
                      }`}
                    >
                      L{layer.level}
                    </span>
                    <Icon className={`w-4 h-4 ${isTarget ? 'text-white' : 'text-[#8b929a]'}`} />
                    <span
                      className={`text-xs font-bold tracking-wider uppercase ${
                        isTarget ? 'text-white' : 'text-[#e6e7e9]'
                      }`}
                    >
                      {layer.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#8b929a] font-mono font-bold tracking-wider">
                    {layer.code}
                  </span>
                </div>

                {/* Layer Subtitle & Primitives */}
                <div className="py-2 space-y-1.5">
                  <p className="text-[11px] text-[#8b929a] leading-relaxed">
                    {layer.subtitle}
                  </p>
                  <p className="text-[10px] text-[#5f6670] font-mono">
                    <span className="text-[#8b929a] font-medium">PRIM:</span> {layer.primitives}
                  </p>
                </div>

                {/* Layer Footer / Standard */}
                <div className="flex items-center justify-between pt-2 border-t border-[#20252b]/70 text-[10px]">
                  <span className="text-[#8b929a] uppercase tracking-wider font-semibold font-mono">
                    STD: {layer.standard}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(layer.moduleId);
                    }}
                    className={`flex items-center space-x-1 font-bold transition-colors cursor-pointer ${
                      isTarget ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#8b929a] hover:text-[#e6e7e9]'
                    }`}
                  >
                    <span className="text-[10px]">OPEN WORKBENCH</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightweight Floating HUD / Selected Layer Annotation (No Outer Card, No Full Width Panel) */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[2px] bg-[#090b0e]/90 border border-[#20252b] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10.5px] font-bold text-emerald-400 font-mono">L{activeLayer.level} ACTIVE</span>
            <span className="text-[#5f6670]">|</span>
            <span className="text-[10.5px] font-bold text-[#e6e7e9] tracking-wider uppercase">{activeLayer.title}</span>
            <span className="text-[#5f6670] hidden md:inline">|</span>
            <span className="text-[10px] text-[#8b929a] font-mono hidden md:inline">{activeLayer.standard}</span>
          </div>

          <button
            onClick={() => onNavigate(activeLayer.moduleId)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[2px] bg-[#11151a]/95 hover:bg-[#161a20] border border-[#303844] hover:border-[#8b929a] text-white text-[10.5px] font-bold transition-all cursor-pointer backdrop-blur-md group self-start sm:self-auto"
          >
            <span>OPEN {activeLayer.code} WORKBENCH</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
