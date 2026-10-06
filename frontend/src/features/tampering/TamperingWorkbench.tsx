import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { ProtocolFlow, type FlowMessage } from '../../components/workstation/ProtocolFlow';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import {
  generateAesKey,
  generateNonce,
  aesGcmEncrypt,
  aesGcmDecrypt,
  bufferToHex
} from '../../lib/crypto/webCrypto';
import {
  Scissors,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { AdversaryAttack3D } from '../../components/visualization/AdversaryAttack3D';

export const TamperingWorkbench: React.FC = () => {
  const [plaintext] = useState<string>('Authorize wire transfer of $1,000,000 to Account #7731');
  const [aad] = useState<string>('Routing: SWIFT-FEDWIRE | Clearance: Level-4');

  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [originalPacket, setOriginalPacket] = useState<{
    ciphertextHex: string;
    tagHex: string;
    nonceHex: string;
    aad: string;
  } | null>(null);

  // Attack Vector selection
  const [activeTamperMode, setActiveTamperMode] = useState<'none' | 'ciphertext' | 'aad' | 'nonce'>('none');

  // Transmitted/Mutated Wire Packet
  const [wireCiphertext, setWireCiphertext] = useState<string>('');
  const [wireTag, setWireTag] = useState<string>('');
  const [wireNonceHex, setWireNonceHex] = useState<string>('');
  const [wireAad, setWireAad] = useState<string>('');

  const [receiverResult, setReceiverResult] = useState<{
    success: boolean;
    plaintext?: string;
    error?: string;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Initialized active adversary wire interception laboratory',
      direction: 'internal',
      status: 'info'
    }
  ]);

  const addEvent = (
    actor: 'ALICE' | 'BOB' | 'NETWORK' | 'ATTACKER' | 'SYSTEM',
    action: string,
    direction: 'outbound' | 'inbound' | 'internal' | 'intercepted' = 'internal',
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

  const initData = async () => {
    setLoading(true);
    try {
      const { key } = await generateAesKey();
      setAesKey(key);

      const freshNonce = generateNonce(12);
      const nonceHex = bufferToHex(freshNonce);

      const enc = await aesGcmEncrypt(plaintext, key, freshNonce, aad);
      const baseline = {
        ciphertextHex: enc.ciphertextHex,
        tagHex: enc.tagHex,
        nonceHex,
        aad
      };

      setOriginalPacket(baseline);
      setWireCiphertext(enc.ciphertextHex);
      setWireTag(enc.tagHex);
      setWireNonceHex(nonceHex);
      setWireAad(aad);
      setActiveTamperMode('none');

      // Receiver initial verification
      const dec = await aesGcmDecrypt(enc.ciphertextHex, enc.tagHex, nonceHex, key, aad);
      setReceiverResult(dec);

      addEvent('ALICE', 'Generated authenticated baseline packet (Ciphertext + Nonce + AAD + GHASH Tag)', 'outbound', 'info');
      addEvent('NETWORK', 'Packet in transit on public wire', 'internal', 'info');
      addEvent('BOB', 'Authentication verified: Plaintext released to receiver', 'inbound', 'success');
    } catch (err: any) {
      addEvent('SYSTEM', `Initialization error: ${err.message}`, 'internal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Attack Actions
  const handleTamperCiphertext = async () => {
    if (!originalPacket || !aesKey) return;
    const chars = originalPacket.ciphertextHex.split('');
    chars[0] = chars[0] === 'a' ? 'b' : 'a';
    const modified = chars.join('');

    setWireCiphertext(modified);
    setWireTag(originalPacket.tagHex);
    setWireNonceHex(originalPacket.nonceHex);
    setWireAad(originalPacket.aad);
    setActiveTamperMode('ciphertext');

    addEvent('ATTACKER', 'In-flight bit-flip: Modified first nibble of ciphertext payload', 'intercepted', 'warn');

    const dec = await aesGcmDecrypt(modified, originalPacket.tagHex, originalPacket.nonceHex, aesKey, originalPacket.aad);
    setReceiverResult(dec);

    addEvent('BOB', 'Executing GHASH authentication polynomial check...', 'inbound', 'info');
    addEvent('BOB', 'AUTHENTICATION FAILED: Ciphertext integrity violated. Plaintext NOT released.', 'inbound', 'error');
  };

  const handleTamperAad = async () => {
    if (!originalPacket || !aesKey) return;
    const forgedAad = 'Routing: REDIRECT_TO_ATTACKER_ACCOUNT | Clearance: Level-1';

    setWireCiphertext(originalPacket.ciphertextHex);
    setWireTag(originalPacket.tagHex);
    setWireNonceHex(originalPacket.nonceHex);
    setWireAad(forgedAad);
    setActiveTamperMode('aad');

    addEvent('ATTACKER', `In-flight header forge: Mutated Associated Data (AAD) to "${forgedAad}"`, 'intercepted', 'warn');

    const dec = await aesGcmDecrypt(originalPacket.ciphertextHex, originalPacket.tagHex, originalPacket.nonceHex, aesKey, forgedAad);
    setReceiverResult(dec);

    addEvent('BOB', 'Executing GHASH authentication polynomial check...', 'inbound', 'info');
    addEvent('BOB', 'AUTHENTICATION FAILED: AAD metadata forged. Plaintext NOT released.', 'inbound', 'error');
  };

  const handleTamperNonce = async () => {
    if (!originalPacket || !aesKey) return;
    const nonceChars = originalPacket.nonceHex.split('');
    nonceChars[0] = nonceChars[0] === '0' ? '1' : '0';
    const corruptedNonce = nonceChars.join('');

    setWireCiphertext(originalPacket.ciphertextHex);
    setWireTag(originalPacket.tagHex);
    setWireNonceHex(corruptedNonce);
    setWireAad(originalPacket.aad);
    setActiveTamperMode('nonce');

    addEvent('ATTACKER', 'In-flight IV corruption: Mutated initialization vector nonce bits', 'intercepted', 'warn');

    const dec = await aesGcmDecrypt(originalPacket.ciphertextHex, originalPacket.tagHex, corruptedNonce, aesKey, originalPacket.aad);
    setReceiverResult(dec);

    addEvent('BOB', 'Executing GHASH authentication polynomial check...', 'inbound', 'info');
    addEvent('BOB', 'AUTHENTICATION FAILED: IV mismatch detected. Plaintext NOT released.', 'inbound', 'error');
  };

  const handleRestoreOriginal = async () => {
    if (!originalPacket || !aesKey) return;
    setWireCiphertext(originalPacket.ciphertextHex);
    setWireTag(originalPacket.tagHex);
    setWireNonceHex(originalPacket.nonceHex);
    setWireAad(originalPacket.aad);
    setActiveTamperMode('none');

    const dec = await aesGcmDecrypt(
      originalPacket.ciphertextHex,
      originalPacket.tagHex,
      originalPacket.nonceHex,
      aesKey,
      originalPacket.aad
    );
    setReceiverResult(dec);

    addEvent('SYSTEM', 'Restored wire packet to authentic state', 'internal', 'info');
    addEvent('BOB', 'Authentication verified: Plaintext released to receiver', 'inbound', 'success');
  };

  useEffect(() => {
    initData();
  }, []);

  const flowMessages: FlowMessage[] = [
    {
      id: 'wire-frame',
      sender: 'alice',
      receiver: 'bob',
      label: 'AEAD Transmitted Frame',
      type: 'ciphertext',
      status: activeTamperMode !== 'none' ? 'failed' : 'delivered',
      intercepted: activeTamperMode !== 'none',
      modified: activeTamperMode !== 'none',
      tamperedDetail:
        activeTamperMode === 'ciphertext'
          ? 'Bit-flipped ciphertext payload'
          : activeTamperMode === 'aad'
          ? 'Forged unencrypted associated data header'
          : activeTamperMode === 'nonce'
          ? 'Corrupted initialization vector'
          : undefined,
      payloadPreview: `CT: ${wireCiphertext.substring(0, 16)}... | IV: ${wireNonceHex.substring(0, 8)}... | Tag: ${wireTag.substring(0, 8)}...`
    }
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workstation Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-[#e6e7e9] tracking-wider uppercase">
                TAMPERING STUDIO & ACTIVE ADVERSARY SIMULATION
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-rose-950/40 border border-rose-800 text-rose-300 font-semibold">
                ACTIVE MITM TESTBED
              </span>
            </div>
            <div className="text-[10px] text-[#8b929a]">
              In-flight wire corruption // Test ciphertext bit-flips, AAD header forgery & IV corruption under Dolev-Yao model
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={initData}
            disabled={loading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] font-bold text-[10.5px] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>NEW PACKET</span>
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="TAMPERING STUDIO EVALUATION STATUS"
          encryption="complete"
          authentication={receiverResult?.success ? 'verified' : 'failed'}
          customItems={[
            {
              id: 'wire_state',
              label: 'WIRE STATE',
              status: activeTamperMode === 'none' ? 'established' : 'failed',
              detail: activeTamperMode === 'none' ? 'UNMODIFIED' : `TAMPERED (${activeTamperMode.toUpperCase()})`
            },
            {
              id: 'receiver_auth',
              label: 'AUTHENTICATION',
              status: receiverResult?.success ? 'verified' : 'failed',
              detail: receiverResult?.success ? 'TAG MATCH' : 'TAG MISMATCH'
            },
            {
              id: 'plaintext_release',
              label: 'PLAINTEXT RELEASE',
              status: receiverResult?.success ? 'complete' : 'failed',
              detail: receiverResult?.success ? 'RELEASED' : 'BLOCKED / DROPPED'
            }
          ]}
        />
      </div>

      {/* 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Left Column: Attack Controls & Baseline Envelope */}
        <div className="space-y-4 min-w-0">
          <Card title="1. ACTIVE ADVERSARY TAMPER CONTROLS">
            <div className="space-y-2 text-[10px]">
              <div className="text-slate-400 font-semibold uppercase text-[9.5px]">
                Inject Attack Vector into Wire Frame:
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={handleTamperCiphertext}
                  className={`px-2 py-1.5 rounded-[2px] border font-bold text-[10px] transition-colors flex items-center justify-between ${
                    activeTamperMode === 'ciphertext'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-900/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Scissors className="w-3 h-3" />
                    <span>TAMPER CIPHERTEXT</span>
                  </div>
                  <span className="text-[8.5px] opacity-75">1-BIT FLIP</span>
                </button>

                <button
                  onClick={handleTamperAad}
                  className={`px-2 py-1.5 rounded-[2px] border font-bold text-[10px] transition-colors flex items-center justify-between ${
                    activeTamperMode === 'aad'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-900/60 text-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Edit3 className="w-3 h-3" />
                    <span>TAMPER AAD</span>
                  </div>
                  <span className="text-[8.5px] opacity-75">HEADER FORGE</span>
                </button>

                <button
                  onClick={handleTamperNonce}
                  className={`px-2 py-1.5 rounded-[2px] border font-bold text-[10px] transition-colors flex items-center justify-between ${
                    activeTamperMode === 'nonce'
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                      : 'bg-indigo-950/30 hover:bg-indigo-900/40 border-indigo-900/60 text-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <AlertOctagon className="w-3 h-3" />
                    <span>TAMPER NONCE</span>
                  </div>
                  <span className="text-[8.5px] opacity-75">IV CORRUPTION</span>
                </button>
              </div>

              {activeTamperMode !== 'none' && (
                <div className="pt-1">
                  <button
                    onClick={handleRestoreOriginal}
                    className="w-full px-2 py-1 rounded-[2px] bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 font-bold text-[10px] transition-colors"
                  >
                    RESTORE ORIGINAL
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card title="AUTHENTIC BASELINE PAYLOAD">
            <div className="space-y-1.5 text-[10px]">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[9px] block">Baseline Plaintext:</span>
                <div className="p-1 rounded-[2px] bg-[#06090e] border border-[#141d2a] text-slate-300 truncate">
                  {plaintext}
                </div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[9px] block">Baseline AAD:</span>
                <div className="p-1 rounded-[2px] bg-[#06090e] border border-[#141d2a] text-amber-300 truncate">
                  {aad}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column: 3D Adversary Mutation Rig, Protocol Flow & Wire Packet */}
        <div className="space-y-4 min-w-0">
          <AdversaryAttack3D
            tamperTarget={activeTamperMode === 'none' ? null : activeTamperMode}
            isTampered={activeTamperMode !== 'none'}
            tamperMessage={activeTamperMode !== 'none' ? `Adversary injected in-transit bit corruption into [${activeTamperMode.toUpperCase()}]` : undefined}
            wireCiphertext={wireCiphertext}
            wireTag={wireTag}
            wireNonce={wireNonceHex}
          />

          <ProtocolFlow
            title="PHYSICAL TRANSMISSION (SENDER &rarr; WIRE &rarr; RECEIVER)"
            messages={flowMessages}
          />

          {/* Wire Transmitted Packet Inspection */}
          <Card
            title="INTERCEPTED WIRE PACKET ENVELOPE"
            action={
              activeTamperMode !== 'none' ? (
                <span className="text-[9px] text-rose-400 font-bold px-1.5 py-0.2 rounded-[2px] bg-rose-950/60 border border-rose-800">
                  MUTATED ON WIRE
                </span>
              ) : (
                <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.2 rounded-[2px] bg-emerald-950/60 border border-emerald-800">
                  INTACT
                </span>
              )
            }
          >
            <div className="space-y-1.5 text-[10px]">
              <div>
                <span className="text-[#5f6670] uppercase font-semibold text-[9px] block">Wire Nonce (96-bit IV):</span>
                <div
                  className={`p-1 rounded-[2px] font-mono truncate ${
                    activeTamperMode === 'nonce'
                      ? 'bg-rose-950/40 border border-rose-700 text-rose-300 font-bold'
                      : 'bg-[#090b0e] border border-[#20252b] text-[#cbd5e1]'
                  }`}
                >
                  {wireNonceHex}
                </div>
              </div>

              <div>
                <span className="text-[#5f6670] uppercase font-semibold text-[9px] block">Wire AAD Header:</span>
                <div
                  className={`p-1 rounded-[2px] font-mono truncate ${
                    activeTamperMode === 'aad'
                      ? 'bg-rose-950/40 border border-rose-700 text-rose-300 font-bold'
                      : 'bg-[#090b0e] border border-[#20252b] text-amber-300'
                  }`}
                >
                  {wireAad}
                </div>
              </div>

              <div>
                <span className="text-[#5f6670] uppercase font-semibold text-[9px] block">Wire Ciphertext:</span>
                <div
                  className={`p-1 rounded-[2px] font-mono truncate ${
                    activeTamperMode === 'ciphertext'
                      ? 'bg-rose-950/40 border border-rose-700 text-rose-300 font-bold'
                      : 'bg-[#090b0e] border border-[#20252b] text-[#e6e7e9]'
                  }`}
                >
                  {wireCiphertext}
                </div>
              </div>

              <div>
                <span className="text-[#5f6670] uppercase font-semibold text-[9px] block">128-bit GHASH Tag:</span>
                <div className="p-1 rounded-[2px] bg-[#090b0e] border border-[#20252b] font-mono text-emerald-400 truncate font-bold">
                  {wireTag}
                </div>
              </div>
            </div>
          </Card>

          {/* Receiver Cryptographic Decision */}
          {receiverResult && (
            <div
              className={`p-2.5 rounded-[2px] border font-mono text-xs ${
                receiverResult.success
                  ? 'bg-[#081510] border-emerald-900/80 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-700 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {receiverResult.success ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold tracking-wider uppercase text-[11px] block">
                    {receiverResult.success
                      ? 'AUTHENTICATION VERIFIED — PLAINTEXT RELEASED'
                      : 'AUTHENTICATION FAILED — PLAINTEXT NOT RELEASED'}
                  </span>
                  <span className="text-[10px] text-slate-300 block mt-0.5 leading-relaxed">
                    {receiverResult.success
                      ? `Recovered Payload: "${receiverResult.plaintext}"`
                      : 'Cryptographic Boundary Enforcement: GHASH authentication tag check failed on tampered packet. Plaintext safely discarded.'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inspector & Observation */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="WIRE PACKET INSPECTOR"
            protocol="AES-256-GCM AEAD"
            sections={[
              {
                id: 'transit',
                title: 'WIRE PACKET PARAMETERS',
                fields: [
                  { id: 'iv', label: 'Nonce (IV)', value: wireNonceHex, tag: '96 BITS', copyable: true },
                  { id: 'tag', label: 'GHASH Tag', value: wireTag, tag: '128 BITS', copyable: true },
                  { id: 'aad', label: 'Wire AAD', value: wireAad, copyable: true },
                  { id: 'ct', label: 'Ciphertext', value: wireCiphertext ? `${wireCiphertext.substring(0, 20)}...` : '—', copyable: true }
                ]
              }
            ]}
          />

          <AttackerView
            title="NETWORK OBSERVATION"
            threatModel="Active Man-in-the-Middle wire interception"
            tampered={activeTamperMode !== 'none'}
            tamperMessage={activeTamperMode !== 'none' ? `Attack Vector: ${activeTamperMode.toUpperCase()}` : undefined}
            observable={[
              { id: 'obs_iv', label: 'Transmitted IV', value: wireNonceHex },
              { id: 'obs_aad', label: 'Transmitted AAD', value: wireAad },
              { id: 'obs_ct', label: 'Transmitted CT', value: wireCiphertext ? wireCiphertext.substring(0, 20) + '...' : '' },
              { id: 'obs_tag', label: 'Transmitted Tag', value: wireTag }
            ]}
            protectedItems={[
              { id: 'prot_key', label: 'AES-256 Symmetric Key' },
              { id: 'prot_plain', label: 'Confidential Plaintext' }
            ]}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Real Event Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="TAMPERING STUDIO EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
