import { Card } from '../../components/ui/Card';
import type { ActiveModule } from '../../components/layout/Sidebar';
import {
  Binary,
  KeyRound,
  ArrowRightLeft,
  FileSignature,
  Hash,
  Lock,
  Network,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface OverviewWorkbenchProps {
  onNavigate: (module: ActiveModule) => void;
}

export const OverviewWorkbench: React.FC<OverviewWorkbenchProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'modular' as ActiveModule,
      title: 'Modular Arithmetic',
      icon: Binary,
      category: 'MATHEMATICS',
      desc: 'Finite cyclic groups, Euclidean GCD, Bézout coefficients, modular inversion, and binary modular exponentiation.'
    },
    {
      id: 'rsa' as ActiveModule,
      title: 'RSA Workbench',
      icon: KeyRound,
      category: 'ASYMMETRIC',
      desc: 'Prime factorization asymmetry, Euler totient, key derivation (n, e, d), and numerical/text message encryption.'
    },
    {
      id: 'dh' as ActiveModule,
      title: 'Diffie-Hellman',
      icon: ArrowRightLeft,
      category: 'KEY EXCHANGE',
      desc: 'Symmetric key establishment over observable channels. Discrete logarithm hardness and eavesdropper visibility.'
    },
    {
      id: 'ecdh' as ActiveModule,
      title: 'ECDH (P-256)',
      icon: ArrowRightLeft,
      category: 'KEY EXCHANGE',
      desc: 'Elliptic curve scalar multiplication, shared point derivation, and HKDF-SHA256 session key derivation.'
    },
    {
      id: 'ecdsa' as ActiveModule,
      title: 'ECDSA Signatures',
      icon: FileSignature,
      category: 'AUTHENTICATION',
      desc: 'Asymmetric message signing, DER formatted signature generation, and live tampering detection.'
    },
    {
      id: 'sha256' as ActiveModule,
      title: 'SHA-256 Workbench',
      icon: Hash,
      category: 'HASHING',
      desc: 'One-way cryptographic digests and the Avalanche Effect: Hamming distance and bit-by-bit mismatch analysis.'
    },
    {
      id: 'aes' as ActiveModule,
      title: 'AES-GCM (AEAD)',
      icon: Lock,
      category: 'SYMMETRIC',
      desc: 'Authenticated Encryption with Associated Data (AEAD). Secret key, public nonce (IV), ciphertext, and GHASH tag.'
    },
    {
      id: 'secure-channel' as ActiveModule,
      title: 'Secure Channel',
      icon: Network,
      category: 'PROTOCOLS',
      desc: 'Full protocol simulation (TLS 1.3 pattern): Ephemeral ECDH + HKDF + AES-GCM wire transmission & verification.'
    },
    {
      id: 'tampering' as ActiveModule,
      title: 'Tampering / MitM',
      icon: ShieldAlert,
      category: 'ATTACKS',
      desc: 'Active adversary laboratory: in-flight bit-flipping, header forging, and recipient cryptographic rejection.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div>
        <h1 className="font-mono text-lg font-bold text-slate-100 uppercase tracking-tight">
          Cryptography Research & Experimentation Workbench
        </h1>
        <p className="font-mono text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Interactive laboratory for testing cryptographic primitives, inspecting intermediate state transitions,
          and evaluating security boundaries under active network adversary models.
        </p>
      </div>

      {/* Protocol Architecture Banner */}
      <Card title="INTEGRATED CRYPTOGRAPHIC STACK ARCHITECTURE">
        <div className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto p-2 bg-slate-950/70 border border-slate-800 rounded">
          <pre>{`EPHEMERAL ASYMMETRIC HANDSHAKE        KEY DERIVATION            AUTHENTICATED ENCRYPTED TUNNEL
───────────────────────────────        ──────────────            ──────────────────────────────
Alice Keypair (d_A, Q_A) ────┐
                             ├──► ECDH Shared Point S ──► HKDF-SHA256 ──► AES-256-GCM [Ciphertext, Nonce, Tag]
Bob Keypair   (d_B, Q_B) ────┘`}</pre>
        </div>
      </Card>

      {/* Grid of Workbenches */}
      <div>
        <div className="font-mono text-xs uppercase font-semibold text-slate-400 mb-3 tracking-wider">
          Available Workbenches
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-sm cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-sky-400 font-semibold tracking-wider">
                      {card.category}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <h3 className="font-mono text-sm font-bold text-slate-200 group-hover:text-white transition-colors mb-1.5">
                    {card.title}
                  </h3>
                  <p className="font-mono text-[11px] text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500 group-hover:text-sky-400">
                  <span>LAUNCH WORKBENCH</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
