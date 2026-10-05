import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  generateEcdhKeypair,
  deriveEcdhSharedSecret,
  generateNonce,
  aesGcmEncrypt,
  aesGcmDecrypt,
  bufferToHex
} from '../../lib/crypto/webCrypto';
import {
  Send,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const SecureChannelWorkbench: React.FC = () => {
  const [aliceMsg, setAliceMsg] = useState<string>('Confidential Wire: Transfer $500,000 to Account #8821');
  const [sessionHeader, setSessionHeader] = useState<string>('Seq: 1042 | Proto: TLS_AES_256_GCM_SHA384');

  // Keypairs & Keys
  const [alicePubHex, setAlicePubHex] = useState<string>('');
  const [bobPubHex, setBobPubHex] = useState<string>('');
  const [sharedSecretHex, setSharedSecretHex] = useState<string>('');
  const [aliceSessionKey, setAliceSessionKey] = useState<CryptoKey | null>(null);
  const [bobSessionKey, setBobSessionKey] = useState<CryptoKey | null>(null);

  // Wire State
  const [wirePacket, setWirePacket] = useState<{
    nonce: Uint8Array;
    ciphertextHex: string;
    tagHex: string;
    aad: string;
  } | null>(null);

  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperedCiphertext, setTamperedCiphertext] = useState<string>('');
  const [bobDecryptionResult, setBobDecryptionResult] = useState<{
    success: boolean;
    plaintext?: string;
    error?: string;
  } | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'SECURE-CHANNEL', message: 'Channel initialized: Ephemeral ECDH (P-256) + AES-256-GCM', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'SECURE-CHANNEL',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const initChannel = async () => {
    addLog('Initiating Ephemeral Handshake between Alice and Bob...', 'info');
    const alice = await generateEcdhKeypair();
    const bob = await generateEcdhKeypair();

    setAlicePubHex(alice.pubHex);
    setBobPubHex(bob.pubHex);

    addLog('Alice and Bob exchanging public points across unencrypted channel...', 'info');
    const aliceDerived = await deriveEcdhSharedSecret(alice.keypair.privateKey, bob.keypair.publicKey);
    const bobDerived = await deriveEcdhSharedSecret(bob.keypair.privateKey, alice.keypair.publicKey);

    setSharedSecretHex(aliceDerived.rawBitsHex);
    setAliceSessionKey(aliceDerived.aesKey);
    setBobSessionKey(bobDerived.aesKey);

    setWirePacket(null);
    setBobDecryptionResult(null);
    setIsTampered(false);

    addLog('Handshake complete: Identical 256-bit symmetric session keys established.', 'success');
  };

  const handleSendMessage = async () => {
    if (!aliceSessionKey) return;
    addLog(`Alice encrypting message with AES-256-GCM: "${aliceMsg}"`, 'info');
    const nonce = generateNonce(12);
    const enc = await aesGcmEncrypt(aliceMsg, aliceSessionKey, nonce, sessionHeader);

    const packet = {
      nonce,
      ciphertextHex: enc.ciphertextHex,
      tagHex: enc.tagHex,
      aad: sessionHeader
    };
    setWirePacket(packet);
    setTamperedCiphertext(enc.ciphertextHex);
    setIsTampered(false);
    setBobDecryptionResult(null);
    addLog('Packet transmitted across physical network wire.', 'info');
  };

  const handleTamper = () => {
    if (!wirePacket) return;
    const firstChar = tamperedCiphertext[0];
    const flippedChar = firstChar === '0' ? '1' : '0';
    const mutated = flippedChar + tamperedCiphertext.slice(1);
    setTamperedCiphertext(mutated);
    setIsTampered(true);
    addLog('Adversary Eve intercepted packet and flipped bits in ciphertext on wire!', 'warn');
  };

  const handleDeliverToBob = async () => {
    if (!bobSessionKey || !wirePacket) return;
    addLog('Bob network interface receiving packet from wire...', 'info');
    const dec = await aesGcmDecrypt(
      tamperedCiphertext,
      wirePacket.tagHex,
      bufferToHex(wirePacket.nonce),
      bobSessionKey,
      wirePacket.aad
    );
    setBobDecryptionResult(dec);
    if (dec.success) {
      addLog(`Bob decrypted & verified packet: "${dec.plaintext}"`, 'success');
    } else {
      addLog(`Bob rejected packet: Authentication verification failed (InvalidTag).`, 'error');
    }
  };

  useEffect(() => {
    initChannel();
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            Secure Channel Protocol Workbench
          </h1>
          <Badge variant="prod">FLAGSHIP PROTOCOL SIMULATION</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          End-to-End Encrypted Tunnel: Ephemeral ECDH Handshake + HKDF Key Derivation + AES-256-GCM AEAD Wire Transmission.
        </p>
      </div>

      {/* Protocol Architecture Diagram */}
      <Card
        title="END-TO-END PROTOCOL SEQUENCE"
        action={
          <button
            onClick={initChannel}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RE-KEY EPHEMERAL SESSION</span>
          </button>
        }
      >
        <div className="p-3 bg-slate-950 font-mono text-[11px] text-slate-300 rounded border border-slate-800 space-y-1 overflow-x-auto">
          <pre>{`ALICE (Endpoint)                     NETWORK WIRE (Attacker Eve)                     BOB (Endpoint)
────────────────                     ───────────────────────────                     ──────────────
Generate Keypair (d_A, Q_A) ──────── Transmits Q_A ────────────► Receives Q_A
Receives Q_B ◄────────────────────── Transmits Q_B ───────────── Generate Keypair (d_B, Q_B)
      │                                                                            │
Derives S = d_A · Q_B                                                        Derives S = d_B · Q_A
      │                                                                            │
AES-GCM Encrypt [P, Tag, IV] ─────── Transmits Wire Packet ────► AES-GCM Decrypt & Verify Tag`}</pre>
        </div>
      </Card>

      {/* Endpoint Local States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <Card title="ALICE LOCAL MEMORY (ENDPOINT 1)">
          <div className="space-y-2">
            <div className="text-slate-400 text-[11px]">Private Scalar d_A: [Hidden in hardware security module]</div>
            <CodeBlock label="Public Key Point Q_A (Hex)" value={alicePubHex} />
            <CodeBlock label="Established Symmetric Key (Derived via HKDF)" value={sharedSecretHex ? `${sharedSecretHex.substring(0, 32)}...` : 'Computing...'} highlight />
          </div>
        </Card>

        <Card title="BOB LOCAL MEMORY (ENDPOINT 2)">
          <div className="space-y-2">
            <div className="text-slate-400 text-[11px]">Private Scalar d_B: [Hidden in hardware security module]</div>
            <CodeBlock label="Public Key Point Q_B (Hex)" value={bobPubHex} />
            <CodeBlock label="Established Symmetric Key (Derived via HKDF)" value={sharedSecretHex ? `${sharedSecretHex.substring(0, 32)}...` : 'Computing...'} highlight />
          </div>
        </Card>
      </div>

      {/* Message Composition by Alice */}
      <Card title="1. ALICE COMPOSE & TRANSMIT">
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Plaintext Message</label>
              <input
                type="text"
                value={aliceMsg}
                onChange={(e) => setAliceMsg(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Network Header (AAD - Authenticated Cleartext)</label>
              <input
                type="text"
                value={sessionHeader}
                onChange={(e) => setSessionHeader(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold tracking-wider transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ENCRYPT & TRANSMIT PACKET ACROSS WIRE</span>
          </button>
        </div>
      </Card>

      {/* Physical Wire Frame & Attacker Observation */}
      {wirePacket && (
        <Card title="2. PHYSICAL NETWORK WIRE CAPTURE (ATTACKER EVE INTERCEPT)">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>PACKET STRUCTURE ON WIRE</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setTamperedCiphertext(wirePacket.ciphertextHex);
                    setIsTampered(false);
                    addLog('Restored packet on wire to authentic state');
                  }}
                  className="text-slate-400 hover:text-slate-200 underline text-[10px]"
                >
                  Restore Authentic
                </button>
                <button
                  onClick={handleTamper}
                  className="text-rose-400 hover:text-rose-300 font-bold underline text-[10px]"
                >
                  ⚡ TAMPER WITH PACKET (BIT-FLIP ATTACK)
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Nonce (IV): </span>
                  <span className="text-slate-300">{bufferToHex(wirePacket.nonce)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tag (GHASH MAC): </span>
                  <span className="text-sky-400">{wirePacket.tagHex}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Transmitted Ciphertext: </span>
                <div className={`p-1.5 rounded break-all text-xs font-bold ${isTampered ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-200'}`}>
                  {tamperedCiphertext}
                </div>
                {isTampered && <span className="text-[10px] text-rose-400">🚨 Ciphertext mutated by adversary in flight</span>}
              </div>

              <div className="text-[11px]">
                <span className="text-slate-500">Associated Data Header: </span>
                <span className="text-slate-300">{wirePacket.aad}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2 bg-slate-900/50 border border-slate-800/80 rounded text-[11px]">
              <div>
                <span className="text-emerald-400 font-bold">Adversary Observes:</span>
                <div className="text-slate-400">Public points, Nonce, Ciphertext, Tag, Headers</div>
              </div>
              <div>
                <span className="text-rose-400 font-bold">Adversary CANNOT Access:</span>
                <div className="text-slate-400">Private keys, Raw shared secret, Plaintext</div>
              </div>
            </div>

            <button
              onClick={handleDeliverToBob}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold tracking-wider transition-colors border border-slate-700"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>DELIVER PACKET TO BOB ENDPOINT</span>
            </button>
          </div>
        </Card>
      )}

      {/* Bob Receiver Panel */}
      {bobDecryptionResult && (
        <Card title="3. BOB RECEIVER INTERFACE EVALUATION">
          <div
            className={`p-3.5 rounded border font-mono text-xs flex items-center space-x-3 ${
              bobDecryptionResult.success
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            {bobDecryptionResult.success ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">MESSAGE AUTHENTICATED & DELIVERED</div>
                  <div className="text-slate-200 mt-0.5 text-xs">
                    Decrypted Plaintext: <span className="text-white font-bold">{bobDecryptionResult.plaintext}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">MESSAGE REJECTED: AUTHENTICATION FAILED</div>
                  <div className="text-rose-300/80 mt-0.5 text-xs">
                    GHASH authentication tag mismatch. Bob detected packet modification on wire and aborted decryption.
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
