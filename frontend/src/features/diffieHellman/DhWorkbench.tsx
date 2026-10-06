import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { ProtocolFlow, type FlowMessage } from '../../components/workstation/ProtocolFlow';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import { executeDhExchange } from '../../lib/crypto/diffieHellman';
import { RefreshCw, Key, CheckCircle2 } from 'lucide-react';

export const DhWorkbench: React.FC = () => {
  // Public parameters (p, g)
  const [p, setP] = useState<string>('23');
  const [g, setG] = useState<string>('5');

  // Private exponents (a, b)
  const [a, setA] = useState<string>('6');
  const [b, setB] = useState<string>('15');

  // Protocol Trace Events
  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Public parameters negotiated: p=23, g=5',
      direction: 'internal',
      status: 'info',
      metadata: { modulus: '23', generator: '5' }
    },
    {
      id: 'init-2',
      timestamp: '00:00:02',
      actor: 'ALICE',
      action: 'Private exponent generated: a=6',
      direction: 'internal',
      status: 'info'
    },
    {
      id: 'init-3',
      timestamp: '00:00:02',
      actor: 'ALICE',
      action: 'Public value computed: A = g^a mod p = 8',
      direction: 'outbound',
      status: 'success'
    },
    {
      id: 'init-4',
      timestamp: '00:00:03',
      actor: 'BOB',
      action: 'Private exponent generated: b=15',
      direction: 'internal',
      status: 'info'
    },
    {
      id: 'init-5',
      timestamp: '00:00:03',
      actor: 'BOB',
      action: 'Public value computed: B = g^b mod p = 19',
      direction: 'outbound',
      status: 'success'
    },
    {
      id: 'init-6',
      timestamp: '00:00:04',
      actor: 'ALICE',
      action: 'A transmitted to Network Wire (A=8)',
      direction: 'outbound',
      status: 'info'
    },
    {
      id: 'init-7',
      timestamp: '00:00:04',
      actor: 'BOB',
      action: 'B transmitted to Network Wire (B=19)',
      direction: 'outbound',
      status: 'info'
    },
    {
      id: 'init-8',
      timestamp: '00:00:05',
      actor: 'ALICE',
      action: 'Shared secret derived: S_alice = B^a mod p = 2',
      direction: 'internal',
      status: 'success'
    },
    {
      id: 'init-9',
      timestamp: '00:00:05',
      actor: 'BOB',
      action: 'Shared secret derived: S_bob = A^b mod p = 2',
      direction: 'internal',
      status: 'success'
    },
    {
      id: 'init-10',
      timestamp: '00:00:06',
      actor: 'SYSTEM',
      action: 'Key agreement verified: Alice and Bob shared secrets match (S=2)',
      direction: 'internal',
      status: 'success',
      metadata: { shared_secret: '2', match: true }
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

  let bigP = 23n, bigG = 5n, bigA = 6n, bigB = 15n;
  try {
    bigP = BigInt(p);
    bigG = BigInt(g);
    bigA = BigInt(a);
    bigB = BigInt(b);
  } catch {
    // Keep defaults
  }

  const exchange = executeDhExchange(bigP, bigG, bigA, bigB);

  const handleRandomizeKeys = () => {
    const newA = Math.floor(Math.random() * 20 + 2).toString();
    const newB = Math.floor(Math.random() * 20 + 2).toString();
    setA(newA);
    setB(newB);

    const freshEx = executeDhExchange(bigP, bigG, BigInt(newA), BigInt(newB));
    addEvent('ALICE', `Fresh private exponent generated: a=${newA}`, 'internal', 'info');
    addEvent('BOB', `Fresh private exponent generated: b=${newB}`, 'internal', 'info');
    addEvent('ALICE', `Public value computed: A = g^a mod p = ${freshEx.A.toString()}`, 'outbound', 'success');
    addEvent('BOB', `Public value computed: B = g^b mod p = ${freshEx.B.toString()}`, 'outbound', 'success');
    addEvent('SYSTEM', `Shared secret computed: S=${freshEx.sharedAlice.toString()}`, 'internal', 'success');
  };

  const handleRandomizeParams = () => {
    const primes = ['23', '29', '31', '37', '41', '43', '47'];
    const newP = primes[Math.floor(Math.random() * primes.length)];
    const newG = '5';
    setP(newP);
    setG(newG);

    addEvent('SYSTEM', `Group parameters randomized: p=${newP}, g=${newG}`, 'internal', 'info', {
      modulus: newP,
      generator: newG
    });
  };

  const flowMessages: FlowMessage[] = [
    {
      id: 'msg-A',
      sender: 'alice',
      receiver: 'bob',
      label: 'Alice Public Key (A)',
      type: 'key-exchange',
      status: 'delivered',
      payloadPreview: `A = g^a mod p = ${g}^${a} mod ${p} = ${exchange.A.toString()}`
    },
    {
      id: 'msg-B',
      sender: 'bob',
      receiver: 'alice',
      label: 'Bob Public Key (B)',
      type: 'key-exchange',
      status: 'delivered',
      payloadPreview: `B = g^b mod p = ${g}^${b} mod ${p} = ${exchange.B.toString()}`
    }
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workstation Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-[#e6e7e9] tracking-wider uppercase">
                DIFFIE-HELLMAN KEY AGREEMENT WORKBENCH
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#161a20] border border-[#20252b] text-[#8b929a] font-semibold">
                FINITE FIELD DH &bull; RFC 3526
              </span>
            </div>
            <div className="text-[10px] text-[#8b929a]">
              Discrete logarithm key agreement // Symmetric key negotiation over unencrypted channels
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleRandomizeParams}
            className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5 text-[#8b929a]" />
            <span>PARAMS</span>
          </button>
          <button
            onClick={handleRandomizeKeys}
            className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-[2px] bg-[#e6e7e9] hover:bg-white text-black font-bold border border-[#e6e7e9] transition-colors cursor-pointer"
          >
            <Key className="w-2.5 h-2.5" />
            <span>GENERATE KEYS</span>
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="DIFFIE-HELLMAN PROTOCOL STATUS"
          keyExchange={exchange.match ? 'established' : 'failed'}
          keyDerivation={exchange.match ? 'complete' : 'idle'}
          customItems={[
            {
              id: 'group_params',
              label: 'PUBLIC GROUP (p, g)',
              status: bigP > 1n ? 'established' : 'failed',
              detail: `p=${p}, g=${g}`
            },
            {
              id: 'alice_key',
              label: 'ALICE KEYPAIR (a, A)',
              status: 'complete',
              detail: `A=${exchange.A.toString()}`
            },
            {
              id: 'bob_key',
              label: 'BOB KEYPAIR (b, B)',
              status: 'complete',
              detail: `B=${exchange.B.toString()}`
            },
            {
              id: 'shared_secret',
              label: 'SHARED SECRET MATCH',
              status: exchange.match ? 'verified' : 'failed',
              detail: exchange.match ? `S=${exchange.sharedAlice.toString()}` : 'Mismatch'
            }
          ]}
        />
      </div>

      {/* 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Left Column: Parameters & Endpoints */}
        <div className="space-y-4 min-w-0">
          <Card title="PUBLIC PARAMETERS">
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-semibold">Modulus (p):</label>
                <input
                  type="text"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] font-mono text-xs focus:border-[#8b929a] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-semibold">Generator (g):</label>
                <input
                  type="text"
                  value={g}
                  onChange={(e) => setG(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] font-mono text-xs focus:border-[#8b929a] focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <Card title="ALICE (INITIATOR)">
            <div className="space-y-1.5 text-[10.5px]">
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8b929a] uppercase font-semibold">Private Exponent (a):</span>
                  <span className="text-rose-400 font-bold text-[9px]">SECRET</span>
                </div>
                <input
                  type="text"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  className="w-full mt-0.5 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-amber-300 font-mono text-xs focus:border-[#8b929a] focus:outline-none"
                />
              </div>
              <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] text-[10px]">
                <span className="text-[#5f6670] uppercase">Public A = g^a mod p:</span>
                <span className="text-[#e6e7e9] font-bold ml-1.5">{exchange.A.toString()}</span>
              </div>
            </div>
          </Card>

          <Card title="BOB (RECIPIENT)">
            <div className="space-y-1.5 text-[10.5px]">
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8b929a] uppercase font-semibold">Private Exponent (b):</span>
                  <span className="text-rose-400 font-bold text-[9px]">SECRET</span>
                </div>
                <input
                  type="text"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  className="w-full mt-0.5 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-amber-300 font-mono text-xs focus:border-[#8b929a] focus:outline-none"
                />
              </div>
              <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] text-[10px]">
                <span className="text-[#5f6670] uppercase">Public B = g^b mod p:</span>
                <span className="text-[#e6e7e9] font-bold ml-1.5">{exchange.B.toString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column: Protocol Flow & Computation */}
        <div className="space-y-4 min-w-0">
          <ProtocolFlow
            title="DIFFIE-HELLMAN WIRE TRANSPORT"
            messages={flowMessages}
          />

          <div
            className={`p-2.5 rounded-[2px] border flex items-center justify-between ${
              exchange.match
                ? 'bg-[#081510] border-emerald-900/80 text-emerald-300'
                : 'bg-rose-950/20 border-rose-800 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold tracking-wider uppercase text-[10.5px]">
                {exchange.match ? 'AGREED SHARED SECRET S' : 'KEY MISMATCH'}
              </span>
            </div>
            <span className="text-[12px] font-bold text-emerald-400 font-mono">
              S = {exchange.sharedAlice.toString()}
            </span>
          </div>

          <div className="p-2.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] text-[10px] space-y-1">
            <div className="text-[#5f6670] uppercase font-semibold text-[9px]">MATHEMATICAL INVARIANT:</div>
            <div className="text-[#8b929a] font-mono">
              Alice: S = B^a mod p = ({exchange.B.toString()})^{a} mod {p} = {exchange.sharedAlice.toString()}
            </div>
            <div className="text-[#8b929a] font-mono">
              Bob: S = A^b mod p = ({exchange.A.toString()})^{b} mod {p} = {exchange.sharedBob.toString()}
            </div>
          </div>
        </div>

        {/* Right Column: Inspector & Observability */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="DIFFIE-HELLMAN PARAMETER INSPECTOR"
            protocol="FFDH"
            sections={[
              {
                id: 'params',
                title: 'GROUP PARAMETERS',
                fields: [
                  { id: 'p_val', label: 'Modulus p', value: p, copyable: true },
                  { id: 'g_val', label: 'Generator g', value: g, copyable: true },
                  { id: 'a_pub', label: 'Public Key A', value: exchange.A.toString(), copyable: true },
                  { id: 'b_pub', label: 'Public Key B', value: exchange.B.toString(), copyable: true }
                ]
              },
              {
                id: 'secrets',
                title: 'PRIVATE & SHARED SECRETS',
                fields: [
                  { id: 'a_priv', label: 'Alice Secret a', value: a, sensitive: true, copyable: true },
                  { id: 'b_priv', label: 'Bob Secret b', value: b, sensitive: true, copyable: true },
                  { id: 's_sec', label: 'Shared Secret S', value: exchange.sharedAlice.toString(), sensitive: true, copyable: true }
                ]
              }
            ]}
          />

          <AttackerView
            title="NETWORK OBSERVATION"
            threatModel="Passive eavesdropper on public channel"
            observable={[
              { id: 'obs_p', label: 'Modulus p', value: p },
              { id: 'obs_g', label: 'Generator g', value: g },
              { id: 'obs_a', label: 'Public A', value: exchange.A.toString() },
              { id: 'obs_b', label: 'Public B', value: exchange.B.toString() }
            ]}
            protectedItems={[
              { id: 'prot_a', label: 'Alice Exponent a' },
              { id: 'prot_b', label: 'Bob Exponent b' },
              { id: 'prot_s', label: 'Shared Secret S' }
            ]}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Real Event Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="DIFFIE-HELLMAN EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
