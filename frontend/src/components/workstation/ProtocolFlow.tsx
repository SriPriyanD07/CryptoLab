import React from 'react';
import {
  User,
  Radio,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeft,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export type LaneId = 'alice' | 'network' | 'bob' | 'attacker';

export interface ProtocolLane {
  id: LaneId;
  label: string;
  sublabel?: string;
  role?: string;
  status?: 'active' | 'idle' | 'listening' | 'compromised';
}

export type MessageStatus =
  | 'normal'
  | 'sending'
  | 'intercepted'
  | 'modified'
  | 'delivered'
  | 'failed';

export type MessageType =
  | 'key-exchange'
  | 'ciphertext'
  | 'handshake'
  | 'signature'
  | 'plaintext';

export interface FlowMessage {
  id: string;
  sender: LaneId;
  receiver: LaneId;
  label: string;
  type: MessageType;
  status: MessageStatus;
  payloadPreview?: string;
  intercepted?: boolean;
  modified?: boolean;
  tamperedDetail?: string;
}

export interface ProtocolFlowProps {
  title?: string;
  lanes?: ProtocolLane[];
  messages: FlowMessage[];
  activeMessageId?: string;
  onIntercept?: (messageId: string) => void;
  onModify?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  className?: string;
}

const defaultLanes: ProtocolLane[] = [
  { id: 'alice', label: 'ALICE', sublabel: 'Endpoint A', role: 'Initiator', status: 'active' },
  { id: 'network', label: 'NETWORK WIRE', sublabel: 'Public Channel', role: 'Transit', status: 'listening' },
  { id: 'bob', label: 'BOB', sublabel: 'Endpoint B', role: 'Recipient', status: 'active' },
  { id: 'attacker', label: 'ADVERSARY', sublabel: 'Man-in-the-Middle', role: 'Interception', status: 'idle' }
];

const laneIconMap: Record<LaneId, React.ComponentType<{ className?: string }>> = {
  alice: User,
  network: Radio,
  bob: Shield,
  attacker: Zap
};

export const ProtocolFlow: React.FC<ProtocolFlowProps> = ({
  title = 'PROTOCOL FLOW & TRANSPORT STREAM',
  lanes = defaultLanes,
  messages,
  activeMessageId,
  className = ''
}) => {
  return (
    <div
      className={`bg-[#0d1014] border border-[#20252b] rounded-[2px] font-mono text-xs select-none ${className}`}
      aria-label="Cryptographic Protocol Sequence and Network Swimlane Diagram"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#20252b] px-2.5 py-1.5 bg-[#090b0e]">
        <div className="flex items-center space-x-1.5">
          <Radio className="w-3 h-3 text-[#8b929a]" />
          <span className="font-semibold text-[#e6e7e9] tracking-wider text-[10px] uppercase">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] text-[#5f6670]">
          <span>[{messages.length} FRAME(S)]</span>
          <span>&bull;</span>
          <span>[{lanes.length} LANES]</span>
        </div>
      </div>

      {/* Lanes Header Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-2 bg-[#090b0e] border-b border-[#20252b]">
        {lanes.map((lane) => {
          const Icon = laneIconMap[lane.id] || User;
          const isAttacker = lane.id === 'attacker';
          const isNetwork = lane.id === 'network';

          const borderStyle = isAttacker
            ? 'border-rose-900/40 bg-rose-950/20 text-rose-300'
            : isNetwork
            ? 'border-amber-900/40 bg-amber-950/20 text-amber-300'
            : 'border-[#20252b] bg-[#11151a] text-[#e6e7e9]';

          return (
            <div
              key={lane.id}
              className={`px-2 py-1.5 rounded-[2px] border flex items-center justify-between ${borderStyle}`}
            >
              <div className="flex items-center space-x-1.5">
                <Icon className="w-3 h-3 shrink-0" />
                <div>
                  <div className="font-bold text-[10px] tracking-wider uppercase">{lane.label}</div>
                  {lane.sublabel && <div className="text-[8.5px] text-[#5f6670]">{lane.sublabel}</div>}
                </div>
              </div>
              {lane.role && (
                <span className="text-[8px] px-1 py-0.2 rounded-[2px] bg-[#050607] border border-[#20252b] text-[#8b929a] font-mono">
                  {lane.role}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Sequence Swimlane Body */}
      <div className="p-2 space-y-2">
        {messages.length === 0 ? (
          <div className="text-slate-600 italic text-center py-4 text-[10px]">
            No protocol frames in transit.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isLeftToRight =
              (msg.sender === 'alice' && (msg.receiver === 'network' || msg.receiver === 'bob')) ||
              (msg.sender === 'network' && msg.receiver === 'bob');

            const isIntercepted = msg.status === 'intercepted';
            const isModified = msg.status === 'modified';
            const isFailed = msg.status === 'failed';
            const isDelivered = msg.status === 'delivered';

            const cardBorder = isFailed
              ? 'border-rose-800 bg-rose-950/20'
              : isModified
              ? 'border-amber-700 bg-amber-950/20'
              : isIntercepted
              ? 'border-rose-900/70 bg-rose-950/15'
              : isDelivered
              ? 'border-emerald-900/80 bg-emerald-950/15'
              : 'border-[#20252b] bg-[#11151a]';

            return (
              <div
                key={msg.id}
                className={`p-2 rounded-[2px] border transition-all ${cardBorder} ${
                  activeMessageId === msg.id ? 'ring-1 ring-[#e6e7e9]' : ''
                }`}
              >
                {/* Message Step Header */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#20252b] text-[10px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] text-[#5f6670] font-mono">#{idx + 1}</span>
                    <span className="font-bold text-[#e6e7e9] tracking-wide uppercase">{msg.label}</span>
                    <span className="text-[8px] px-1 py-0.2 rounded-[2px] bg-[#090b0e] border border-[#20252b] text-[#8b929a] uppercase">
                      {msg.type}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-1 text-[9px] font-bold tracking-wider uppercase">
                    {isDelivered && (
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>DELIVERED & VERIFIED</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="flex items-center space-x-1 text-rose-400">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>INTEGRITY FAILURE</span>
                      </span>
                    )}
                    {isModified && (
                      <span className="flex items-center space-x-1 text-amber-400">
                        <Scissors className="w-2.5 h-2.5" />
                        <span>PAYLOAD MUTATED</span>
                      </span>
                    )}
                    {isIntercepted && (
                      <span className="flex items-center space-x-1 text-rose-400">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>INTERCEPTED (MITM)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Packet Direction & Visual Pathway */}
                <div className="flex items-center justify-between text-[9px] text-[#8b929a] mb-1 px-1">
                  <span className="font-semibold text-[#e6e7e9] uppercase">{msg.sender}</span>
                  <div className="flex items-center space-x-1 text-[#5f6670] grow px-2">
                    <div className="h-[1px] bg-[#20252b] grow"></div>
                    {isLeftToRight ? (
                      <ArrowRight className="w-2.5 h-2.5 text-[#e6e7e9] shrink-0" />
                    ) : (
                      <ArrowLeft className="w-2.5 h-2.5 text-[#e6e7e9] shrink-0" />
                    )}
                    <div className="h-[1px] bg-[#20252b] grow"></div>
                  </div>
                  <span className="font-semibold text-[#e6e7e9] uppercase">{msg.receiver}</span>
                </div>

                {/* Frame Payload Inspection */}
                {msg.payloadPreview && (
                  <div className="bg-[#05080c] border border-[#141b27] rounded-[2px] p-1.5 font-mono text-[9.5px] text-slate-300 break-all select-all flex items-center justify-between">
                    <span className="text-slate-400 truncate">{msg.payloadPreview}</span>
                    {msg.tamperedDetail && (
                      <span className="text-rose-400 text-[8.5px] ml-2 shrink-0 font-bold">
                        [{msg.tamperedDetail}]
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
