import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import { executeDhExchange } from '../../lib/crypto/diffieHellman';
import { RefreshCw } from 'lucide-react';

export const DhWorkbench: React.FC = () => {
  const [p, setP] = useState<string>('23');
  const [g, setG] = useState<string>('5');
  const [a, setA] = useState<string>('6');
  const [b, setB] = useState<string>('15');
  const showMath = true;

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'DH-EXCHANGE', message: 'Initialized public parameters: p=23, g=5', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'DH-PROTOCOL',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  let bigP = 23n, bigG = 5n, bigA = 6n, bigB = 15n;
  try {
    bigP = BigInt(p);
    bigG = BigInt(g);
    bigA = BigInt(a);
    bigB = BigInt(b);
  } catch {
    // fallback
  }

  const exchange = executeDhExchange(bigP, bigG, bigA, bigB);

  const handleRandomizeSecrets = () => {
    const newA = Math.floor(Math.random() * 20) + 2;
    const newB = Math.floor(Math.random() * 20) + 2;
    setA(newA.toString());
    setB(newB.toString());
    addLog(`Generated new ephemeral private keys: a=${newA}, b=${newB}`, 'info');
    addLog(`Alice computed public key A = g^a mod p = ${newA}`, 'info');
    addLog(`Bob computed public key B = g^b mod p = ${newB}`, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            Diffie-Hellman Key Exchange Workbench
          </h1>
          <Badge variant="edu">EDUCATIONAL / INSECURE PARAMETERS</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Establish a shared symmetric secret over an unencrypted, observable channel via Discrete Logarithm hardness.
        </p>
      </div>

      {/* Public Parameters */}
      <Card
        title="PUBLIC PARAMETERS (GLOBALLY KNOWN)"
        action={
          <button
            onClick={handleRandomizeSecrets}
            className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RANDOMIZE SECRETS</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Prime Modulus (p)</label>
            <input
              type="text"
              value={p}
              onChange={(e) => {
                setP(e.target.value);
                addLog(`Updated prime modulus p=${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Generator Base (g)</label>
            <input
              type="text"
              value={g}
              onChange={(e) => {
                setG(e.target.value);
                addLog(`Updated generator g=${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Participants & Exchange Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {/* Alice Panel */}
        <Card title="ALICE LOCAL STATE">
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Alice Private Key (a)</label>
              <input
                type="text"
                value={a}
                onChange={(e) => {
                  setA(e.target.value);
                  addLog(`Alice updated private key a=${e.target.value}`);
                }}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 italic">Held strictly in local memory</span>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded">
              <div className="text-[11px] text-slate-400 uppercase">Computed Public Key A = g^a mod p</div>
              <div className="text-lg font-bold text-sky-400 mt-0.5">{exchange.A.toString()}</div>
              {showMath && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Formula: {g}^{a} mod {p} = {exchange.A.toString()}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bob Panel */}
        <Card title="BOB LOCAL STATE">
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Bob Private Key (b)</label>
              <input
                type="text"
                value={b}
                onChange={(e) => {
                  setB(e.target.value);
                  addLog(`Bob updated private key b=${e.target.value}`);
                }}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 italic">Held strictly in local memory</span>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded">
              <div className="text-[11px] text-slate-400 uppercase">Computed Public Key B = g^b mod p</div>
              <div className="text-lg font-bold text-sky-400 mt-0.5">{exchange.B.toString()}</div>
              {showMath && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Formula: {g}^{b} mod {p} = {exchange.B.toString()}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Network Exchange Protocol Visualization */}
      <Card title="NETWORK TRANSMISSION WIRE">
        <div className="font-mono text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800/80 pb-1">
            <span>ALICE INTERFACE</span>
            <span className="text-slate-500">PUBLIC UNENCRYPTED CHANNEL</span>
            <span>BOB INTERFACE</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sky-400 font-bold">A = {exchange.A.toString()}</span>
            <div className="flex-1 mx-4 flex items-center justify-center text-slate-500 text-[11px]">
              <span>────── Transmits A across network ──────►</span>
            </div>
            <span className="text-slate-400">Receives A</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Receives B</span>
            <div className="flex-1 mx-4 flex items-center justify-center text-slate-500 text-[11px]">
              <span>◄────── Transmits B across network ──────</span>
            </div>
            <span className="text-sky-400 font-bold">B = {exchange.B.toString()}</span>
          </div>
        </div>
      </Card>

      {/* Shared Secret Derivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        <Card title="ALICE DERIVES SHARED SECRET">
          <div className="text-xs space-y-1">
            <div className="text-slate-400 text-[11px]">S_Alice = B^a mod p</div>
            <div className="text-2xl font-bold text-emerald-400">{exchange.sharedAlice.toString()}</div>
            <div className="text-[11px] text-slate-500">
              {exchange.B.toString()}^{a} mod {p} = {exchange.sharedAlice.toString()}
            </div>
          </div>
        </Card>

        <Card title="BOB DERIVES SHARED SECRET">
          <div className="text-xs space-y-1">
            <div className="text-slate-400 text-[11px]">S_Bob = A^b mod p</div>
            <div className="text-2xl font-bold text-emerald-400">{exchange.sharedBob.toString()}</div>
            <div className="text-[11px] text-slate-500">
              {exchange.A.toString()}^{b} mod {p} = {exchange.sharedBob.toString()}
            </div>
          </div>
        </Card>
      </div>

      {exchange.match && (
        <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/80 rounded font-mono text-xs text-emerald-400 flex items-center justify-between">
          <span>✓ KEY AGREEMENT VERIFIED: Independent derivations match exactly (g^(ab) mod p = {exchange.sharedAlice.toString()}).</span>
          <span className="text-[10px] text-emerald-500 uppercase">STATUS: MATCH</span>
        </div>
      )}

      {/* Attacker Observation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="ATTACKER OBSERVATION: PUBLICLY OBSERVABLE">
          <div className="space-y-1 text-xs">
            <CodeBlock label="Prime Modulus p" value={p} />
            <CodeBlock label="Generator Base g" value={g} />
            <CodeBlock label="Transmitted Public Key A" value={exchange.A.toString()} />
            <CodeBlock label="Transmitted Public Key B" value={exchange.B.toString()} />
          </div>
        </Card>

        <Card title="ATTACKER OBSERVATION: STRICTLY HIDDEN (NON-OBSERVABLE)">
          <div className="space-y-1 text-xs">
            <CodeBlock label="Alice Private Key a" value={a} />
            <CodeBlock label="Bob Private Key b" value={b} />
            <CodeBlock label="Derived Symmetric Shared Secret" value={exchange.sharedAlice.toString()} highlight />
          </div>
        </Card>
      </div>

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
