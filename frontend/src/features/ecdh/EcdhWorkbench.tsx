import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { EcdhConvergence3D } from '../../components/visualization/EcdhConvergence3D';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import {
  generateEcdhKeypair,
  deriveEcdhSharedSecret,
  deriveHkdfKeyFromBits,
  hexToBuffer
} from '../../lib/crypto/webCrypto';
import { RefreshCw } from 'lucide-react';

export const EcdhWorkbench: React.FC = () => {
  const [alicePubHex, setAlicePubHex] = useState<string>('');
  const [bobPubHex, setBobPubHex] = useState<string>('');
  const [aliceSecretHex, setAliceSecretHex] = useState<string>('');
  const [bobSecretHex, setBobSecretHex] = useState<string>('');
  const [hkdfSessionKeyHex, setHkdfSessionKeyHex] = useState<string>('');
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Initialized NIST P-256 (SECP256R1) elliptic curve parameters',
      direction: 'internal',
      status: 'info'
    }
  ]);

  const addEvent = (
    actor: 'ALICE' | 'BOB' | 'NETWORK' | 'SYSTEM',
    action: string,
    direction: 'outbound' | 'inbound' | 'internal' = 'internal',
    status: 'info' | 'success' | 'warn' | 'error' = 'info',
    metadata?: Record<string, string | number | boolean>
  ) => {
    const newEvt: ProtocolEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      actor,
      action,
      direction,
      status,
      metadata
    };
    setEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
  };

  const runEcdhExchange = async () => {
    setLoading(true);
    try {
      addEvent('ALICE', 'Generated ephemeral NIST P-256 keypair: Q_A = d_A · G', 'internal', 'info');
      const alice = await generateEcdhKeypair();
      setAlicePubHex(alice.pubHex);

      addEvent('BOB', 'Generated ephemeral NIST P-256 keypair: Q_B = d_B · G', 'internal', 'info');
      const bob = await generateEcdhKeypair();
      setBobPubHex(bob.pubHex);

      addEvent('ALICE', 'Transmitted uncompressed public point Q_A to network wire', 'outbound', 'info');
      addEvent('NETWORK', 'Delivered Q_A to Bob', 'inbound', 'info');
      addEvent('BOB', 'Transmitted uncompressed public point Q_B to network wire', 'outbound', 'info');
      addEvent('NETWORK', 'Delivered Q_B to Alice', 'inbound', 'info');

      addEvent('ALICE', 'Computed elliptic point scalar multiplication: S_A = d_A · Q_B', 'internal', 'info');
      const aliceDerived = await deriveEcdhSharedSecret(alice.keypair.privateKey, bob.keypair.publicKey);
      setAliceSecretHex(aliceDerived.rawBitsHex);

      addEvent('BOB', 'Computed elliptic point scalar multiplication: S_B = d_B · Q_A', 'internal', 'info');
      const bobDerived = await deriveEcdhSharedSecret(bob.keypair.privateKey, alice.keypair.publicKey);
      setBobSecretHex(bobDerived.rawBitsHex);

      const match = aliceDerived.rawBitsHex === bobDerived.rawBitsHex;
      setIsMatching(match);

      if (match) {
        addEvent('SYSTEM', 'Shared secret coordinates match: identical 256-bit curve point established', 'internal', 'success');

        const rawBytes = hexToBuffer(aliceDerived.rawBitsHex);
        const hkdfResult = await deriveHkdfKeyFromBits(rawBytes);
        setHkdfSessionKeyHex(hkdfResult.sessionKeyHex);
        addEvent('SYSTEM', 'HKDF-SHA256 completed: derived 256-bit symmetric session key', 'internal', 'success', {
          kdf: 'HKDF-SHA256',
          keyLength: '256 bits'
        });
      }
    } catch (err: any) {
      addEvent('SYSTEM', `ECDH key agreement error: ${err.message}`, 'internal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEcdhExchange();
  }, []);

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workstation Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-[#e6e7e9] tracking-wider uppercase">
                ECDH KEY AGREEMENT WORKBENCH
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#161a20] border border-[#20252b] text-[#8b929a] font-semibold">
                NIST P-256 (SECP256R1)
              </span>
            </div>
            <div className="text-[10px] text-[#8b929a]">
              Elliptic Curve Diffie-Hellman // Ephemeral point scalar multiplication & HKDF-SHA256 session derivation
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={runEcdhExchange}
            disabled={loading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] font-bold text-[10.5px] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 text-[#8b929a] ${loading ? 'animate-spin' : ''}`} />
            <span>RUN FRESH EXCHANGE</span>
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="ECDH SESSION & DERIVATION STATUS"
          keyExchange={isMatching ? 'established' : 'failed'}
          keyDerivation={hkdfSessionKeyHex ? 'complete' : 'idle'}
          customItems={[
            {
              id: 'curve',
              label: 'CURVE SELECTION',
              status: 'established',
              detail: 'NIST P-256'
            },
            {
              id: 'key_agreement',
              label: 'ECDH KEY AGREEMENT',
              status: isMatching ? 'established' : 'active',
              detail: isMatching ? 'Points Matched' : 'In Progress'
            },
            {
              id: 'kdf',
              label: 'HKDF-SHA256 DERIVATION',
              status: hkdfSessionKeyHex ? 'complete' : 'idle',
              detail: hkdfSessionKeyHex ? '256-bit Session Key' : 'Pending'
            }
          ]}
        />
      </div>

      {/* 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Left Column: Parameters & Endpoints */}
        <div className="space-y-4 min-w-0">
          <Card title="ALICE (INITIATOR)">
            <div className="space-y-2 text-[10.5px]">
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8b929a] uppercase font-semibold">Private Scalar (d_A):</span>
                  <span className="text-rose-400 font-bold text-[9px]">LOCAL ONLY</span>
                </div>
                <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] text-[#5f6670] tracking-widest mt-0.5">
                  ••••••••••••••••••••••••••••••••
                </div>
              </div>

              <div>
                <span className="text-[#8b929a] uppercase font-semibold text-[10px] block">
                  Public Key Point (Q_A):
                </span>
                <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] font-mono text-[9.5px] text-[#e6e7e9] break-all select-all mt-0.5">
                  {alicePubHex || 'Generating...'}
                </div>
              </div>

              <div className="p-1.5 rounded-[2px] bg-[#081310] border border-emerald-900/60">
                <span className="text-[9.5px] text-emerald-400 uppercase font-semibold block">
                  Alice Derived Point:
                </span>
                <span className="font-mono text-[9.5px] text-emerald-300 break-all select-all font-bold block mt-0.5">
                  {aliceSecretHex || 'Computing...'}
                </span>
              </div>
            </div>
          </Card>

          <Card title="BOB (RECIPIENT)">
            <div className="space-y-2 text-[10.5px]">
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8b929a] uppercase font-semibold">Private Scalar (d_B):</span>
                  <span className="text-rose-400 font-bold text-[9px]">LOCAL ONLY</span>
                </div>
                <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] text-[#5f6670] tracking-widest mt-0.5">
                  ••••••••••••••••••••••••••••••••
                </div>
              </div>

              <div>
                <span className="text-[#8b929a] uppercase font-semibold text-[10px] block">
                  Public Key Point (Q_B):
                </span>
                <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] font-mono text-[9.5px] text-[#e6e7e9] break-all select-all mt-0.5">
                  {bobPubHex || 'Generating...'}
                </div>
              </div>

              <div className="p-1.5 rounded-[2px] bg-[#081310] border border-emerald-900/60">
                <span className="text-[9.5px] text-emerald-400 uppercase font-semibold block">
                  Bob Derived Point:
                </span>
                <span className="font-mono text-[9.5px] text-emerald-300 break-all select-all font-bold block mt-0.5">
                  {bobSecretHex || 'Computing...'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column: 3D Protocol Convergence Rig */}
        <div className="space-y-4 min-w-0">
          <EcdhConvergence3D
            alicePublicHex={alicePubHex}
            bobPublicHex={bobPubHex}
            sharedSecretHex={aliceSecretHex}
            sessionKeyHex={hkdfSessionKeyHex}
            secretsMatch={isMatching}
          />
        </div>

        {/* Right Column: Inspector & Observation */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="ECDH PARAMETER INSPECTOR"
            protocol="ECDH (NIST P-256)"
            sections={[
              {
                id: 'curve',
                title: 'CURVE SPECIFICATION',
                fields: [
                  { id: 'c_name', label: 'Curve', value: 'NIST P-256', tag: 'SECP256R1' },
                  { id: 'c_type', label: 'Field', value: 'Prime 𝔽_p (256-bit)' }
                ]
              },
              {
                id: 'endpoints',
                title: 'PUBLIC POINTS',
                fields: [
                  { id: 'pub_a', label: 'Public Q_A', value: alicePubHex, copyable: true },
                  { id: 'pub_b', label: 'Public Q_B', value: bobPubHex, copyable: true }
                ]
              },
              {
                id: 'secrets',
                title: 'DERIVED SECRETS',
                fields: [
                  {
                    id: 'shared_point',
                    label: 'Shared S',
                    value: aliceSecretHex,
                    sensitive: true,
                    copyable: true
                  },
                  {
                    id: 'hkdf_key',
                    label: 'Session K',
                    value: hkdfSessionKeyHex,
                    sensitive: true,
                    copyable: true
                  }
                ]
              }
            ]}
          />

          <AttackerView
            title="NETWORK OBSERVATION"
            threatModel="Passive wire sniffing"
            observable={[
              {
                id: 'obs_curve',
                label: 'Curve Params',
                value: 'SECP256R1 Standard'
              },
              {
                id: 'obs_qa',
                label: 'Alice Point Q_A',
                value: alicePubHex
              },
              {
                id: 'obs_qb',
                label: 'Bob Point Q_B',
                value: bobPubHex
              }
            ]}
            protectedItems={[
              { id: 'prot_da', label: 'Alice Private d_A' },
              { id: 'prot_db', label: 'Bob Private d_B' },
              { id: 'prot_shared', label: 'Shared Point S' },
              { id: 'prot_session', label: 'Session Key K' }
            ]}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Real Event Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="ECDH PROTOCOL EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
