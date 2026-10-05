import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  mod,
  modPow,
  euclideanGcd,
  extendedGcd,
  modInverse,
  getModPowSteps
} from '../../lib/crypto/modMath';

export const ModularWorkbench: React.FC = () => {
  const [a, setA] = useState<string>('17');
  const [b, setB] = useState<string>('28');
  const [n, setN] = useState<string>('12');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'MATH-ENGINE', message: 'Initialized BigInt finite group arithmetic', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'MOD-ENGINE',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  // Safe parsing to BigInt
  let bigA = 17n, bigB = 28n, bigN = 12n;
  let parseError = false;
  try {
    bigA = BigInt(a);
    bigB = BigInt(b);
    bigN = BigInt(n);
    if (bigN <= 0n) parseError = true;
  } catch {
    parseError = true;
  }

  // Computations
  const resAMod = !parseError ? mod(bigA, bigN).toString() : 'ERR';
  const resBMod = !parseError ? mod(bigB, bigN).toString() : 'ERR';
  const resAdd = !parseError ? mod(bigA + bigB, bigN).toString() : 'ERR';
  const resSub = !parseError ? mod(bigA - bigB, bigN).toString() : 'ERR';
  const resMul = !parseError ? mod(bigA * bigB, bigN).toString() : 'ERR';
  const resPow = !parseError && bigB >= 0n ? modPow(bigA, bigB, bigN).toString() : 'N/A';

  const gcdData = !parseError ? euclideanGcd(bigA, bigB) : null;
  const extData = !parseError ? extendedGcd(bigA, bigB) : null;
  const invData = !parseError ? modInverse(bigA, bigN) : null;
  const powSteps = !parseError && bigB >= 0n ? getModPowSteps(bigA, bigB, bigN) : null;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
          Modular Arithmetic Workbench
        </h1>
        <p className="font-mono text-xs text-slate-400">
          Ring arithmetic operations over finite group ℤ_n, Euclidean GCD, Bézout coefficients, and modular inversion.
        </p>
      </div>

      {/* Input Parameters Panel */}
      <Card title="INPUT PARAMETERS">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Integer a</label>
            <input
              type="text"
              value={a}
              onChange={(e) => {
                setA(e.target.value);
                addLog(`Updated integer a = ${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Integer b</label>
            <input
              type="text"
              value={b}
              onChange={(e) => {
                setB(e.target.value);
                addLog(`Updated integer b = ${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Modulus n (n &gt; 0)</label>
            <input
              type="text"
              value={n}
              onChange={(e) => {
                setN(e.target.value);
                addLog(`Updated modulus n = ${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Operations Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="BASIC RESIDUE OPERATIONS (MOD n)">
          <div className="font-mono text-xs space-y-2">
            <div className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-800/80 rounded">
              <span className="text-slate-400">a mod n</span>
              <span className="text-sky-400 font-bold">{resAMod}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-800/80 rounded">
              <span className="text-slate-400">b mod n</span>
              <span className="text-sky-400 font-bold">{resBMod}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-800/80 rounded">
              <span className="text-slate-400">(a + b) mod n</span>
              <span className="text-emerald-400 font-bold">{resAdd}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-800/80 rounded">
              <span className="text-slate-400">(a - b) mod n</span>
              <span className="text-emerald-400 font-bold">{resSub}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-800/80 rounded">
              <span className="text-slate-400">(a * b) mod n</span>
              <span className="text-emerald-400 font-bold">{resMul}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-800/80 rounded">
              <span className="text-slate-400">a^b mod n</span>
              <span className="text-amber-400 font-bold">{resPow}</span>
            </div>
          </div>
        </Card>

        {/* Modular Inversion & GCD */}
        <Card title="GREATEST COMMON DIVISOR & MODULAR INVERSE">
          <div className="font-mono text-xs space-y-3">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Euclidean GCD(a, b)</div>
              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded flex justify-between items-center">
                <span>gcd({a}, {b})</span>
                <span className="font-bold text-sky-400">{gcdData ? gcdData.gcd.toString() : 'ERR'}</span>
              </div>
            </div>

            {extData && (
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Bézout's Identity: a·x + b·y = gcd</div>
                <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded text-slate-300">
                  {a}·({extData.x.toString()}) + {b}·({extData.y.toString()}) = {extData.gcd.toString()}
                </div>
              </div>
            )}

            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Modular Inverse: a⁻¹ mod n</div>
              {invData?.exists ? (
                <div className="p-2 bg-emerald-950/30 border border-emerald-800/60 rounded text-emerald-300">
                  Inverse exists: <span className="font-bold">{invData.inverse?.toString()}</span>
                  <div className="text-[10px] text-emerald-400/80 mt-0.5">
                    ({a} * {invData.inverse?.toString()}) mod {n} = 1
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-rose-950/30 border border-rose-800/60 rounded text-rose-300">
                  Inverse does NOT exist: gcd({a}, {n}) = {invData?.gcd.toString()} ≠ 1
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Binary Exponentiation Trace */}
      {powSteps && (
        <Card title={`SQUARE-AND-MULTIPLY STATE TRACE (${a}^${b} mod ${n} = ${powSteps.result.toString()})`}>
          <div className="font-mono text-xs text-slate-400 mb-2">
            Binary representation of exponent {b}: <span className="text-sky-400">{powSteps.binaryExp}</span> ({powSteps.binaryExp.length} bits)
          </div>
          <div className="overflow-x-auto max-h-48">
            <table className="w-full font-mono text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase">
                  <th className="py-1 px-2">Bit #</th>
                  <th className="py-1 px-2">Bit Value</th>
                  <th className="py-1 px-2">Pre-State</th>
                  <th className="py-1 px-2">Operation</th>
                  <th className="py-1 px-2">Post-State Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {powSteps.steps.map((s) => (
                  <tr key={s.step} className="hover:bg-slate-900/50">
                    <td className="py-1 px-2 text-slate-500">{s.step}</td>
                    <td className="py-1 px-2 text-sky-400 font-bold">{s.bit}</td>
                    <td className="py-1 px-2">{s.result_before}</td>
                    <td className="py-1 px-2 text-slate-400">
                      {s.bit === '1' ? 'Square & Multiply' : 'Square Only'}
                    </td>
                    <td className="py-1 px-2 text-emerald-400 font-bold">{s.result_after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
