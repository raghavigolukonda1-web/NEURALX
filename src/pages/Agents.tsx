import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BrainCircuit, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Globe, 
  Share2, 
  Activity, 
  Terminal, 
  ChevronRight,
  Info,
  Server,
  Layers,
  Database
} from "lucide-react";
import { GlassCard } from "../components/UI";
import { AgentLog } from "../types";

type AgentStatus = "IDLE" | "PROCESSING" | "COMPLETE" | "ERROR";

interface Node {
  id: string;
  label: string;
  icon: any;
  color: string;
  x: string;
  y: string;
  status: AgentStatus;
  description: string;
  specs: {
    layer: string;
    throughput: string;
    model: string;
  };
}

const initialNodes: Node[] = [
  { 
    id: "DATA_IN", 
    label: "Ingestion Hub", 
    icon: Globe, 
    color: "text-brand-accent", 
    x: "10%", y: "50%", 
    status: "IDLE",
    description: "Primary ingestion gateway for multi-vector data streams.",
    specs: { layer: "L1 (Physical)", throughput: "12 GB/s", model: "Buffer_Sync_v2" }
  },
  { 
    id: "PARSER", 
    label: "Neural Parser", 
    icon: Share2, 
    color: "text-emerald-400", 
    x: "30%", y: "30%", 
    status: "IDLE",
    description: "Semantic analysis engine using transformers for structural mapping.",
    specs: { layer: "L2 (Data)", throughput: "4.5M Tps", model: "T5-Forensic-Base" }
  },
  { 
    id: "VALIDATOR", 
    label: "Entropy Val", 
    icon: ShieldAlert, 
    color: "text-amber-400", 
    x: "30%", y: "70%", 
    status: "IDLE",
    description: "Entropy-based validation unit detecting structural anomalies.",
    specs: { layer: "L3 (Logic)", throughput: "8.2M Val/s", model: "Isolation_Forest_X" }
  },
  { 
    id: "AGENT_ML", 
    label: "ML Orchestrator", 
    icon: BrainCircuit, 
    color: "text-blue-400", 
    x: "60%", y: "20%", 
    status: "IDLE",
    description: "Core prediction engine managing ensemble model weights.",
    specs: { layer: "L4 (Model)", throughput: "128 GFLOPS", model: "Ensemble_Nexus_v4" }
  },
  { 
    id: "AGENT_SEC", 
    label: "Security Guard", 
    icon: ShieldAlert, 
    color: "text-rose-400", 
    x: "60%", y: "80%", 
    status: "IDLE",
    description: "Threat signature matcher and behavioral analysis guardian.",
    specs: { layer: "L4 (Defense)", throughput: "250ms Latency", model: "Guardian_CNN_v7" }
  },
  { 
    id: "INSIGHT", 
    label: "Cognitive Synthesizer", 
    icon: Zap, 
    color: "text-indigo-400", 
    x: "85%", y: "50%", 
    status: "IDLE",
    description: "Final intelligence aggregation and human-readable reporting agent.",
    specs: { layer: "L5 (Output)", throughput: "1.2k Rep/m", model: "GPT-Matrix-Turbo" }
  },
];

const connections = [
  { from: "DATA_IN", to: "PARSER" },
  { from: "DATA_IN", to: "VALIDATOR" },
  { from: "PARSER", to: "AGENT_ML" },
  { from: "VALIDATOR", to: "AGENT_SEC" },
  { from: "AGENT_ML", to: "INSIGHT" },
  { from: "AGENT_SEC", to: "INSIGHT" },
];

export const AgentsPage = ({ isProcessing, logs = [] }: { isProcessing: boolean, logs?: AgentLog[] }) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastLogCount, setLastLogCount] = useState(0);

  useEffect(() => {
    if (scrollRef.current && logs.length > lastLogCount) {
      const scrollContainer = scrollRef.current;
      const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;
      
      if (isAtBottom) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
      setLastLogCount(logs.length);
    }
  }, [logs, lastLogCount]);

  const handleAction = (type: string) => {
    if (!selectedNode) return;
    
    // Simulate a real interaction with complex task narrations
    const taskNarrations = {
      ping: [
        `Measuring resonance frequency across node clusters...`,
        `Packet injection successful. Round-trip latency: 14.2ms.`,
        `Stabilizing neural handshake with node group ${selectedNode.id}.`
      ],
      recalibrate: [
        `Re-weighting local model parameters based on global drift.`,
        `Purging cached entropy scores from L2 buffers.`,
        `Executing cold restart on ${selectedNode.specs.model} kernel.`,
        `Re-indexing structural mappings for ${selectedNode.specs.layer}.`
      ]
    };
    
    const randomNarrative = taskNarrations[type as keyof typeof taskNarrations][Math.floor(Math.random() * taskNarrations[type].length)];

    const fakeLog: AgentLog = {
      timestamp: new Date().toISOString(),
      agent: selectedNode.label,
      input: `SYS_CALL::${type.toUpperCase()}`,
      thought: randomNarrative,
      output: `INTEGRITY_CHECK :: PASSED :: ${type.toUpperCase()}_COMPLETE`
    };
    
    // In a real app, this would be a fetch or socket.emit
    // But since logs come from props, we just simulate the feeling of it working
    console.log(`Executing ${type} on ${selectedNode.id}`);
  };

  useEffect(() => {
    if (isProcessing) {
      const sequence = ["DATA_IN", "PARSER", "VALIDATOR", "AGENT_ML", "AGENT_SEC", "INSIGHT"];
      let step = 0;

      const interval = setInterval(() => {
        setNodes(prev => prev.map(n => {
          if (n.id === sequence[step]) return { ...n, status: "PROCESSING" };
          if (sequence.slice(0, step).includes(n.id)) return { ...n, status: "COMPLETE" };
          return { ...n, status: "IDLE" };
        }));

        step++;
        if (step > sequence.length) {
          clearInterval(interval);
        }
      }, 1200);

      return () => clearInterval(interval);
    } else {
      setNodes(prev => prev.map(n => ({ ...n, status: "IDLE" })));
    }
  }, [isProcessing]);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "PROCESSING": return "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]";
      case "COMPLETE": return "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
      case "ERROR": return "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]";
      default: return "border-slate-800";
    }
  };

  const getStatusDot = (status: AgentStatus) => {
    switch (status) {
      case "PROCESSING": return "bg-blue-500 animate-pulse";
      case "COMPLETE": return "bg-emerald-500";
      case "ERROR": return "bg-rose-500";
      default: return "bg-slate-700";
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Agent <span className="text-brand-accent">Topology</span></h1>
          <p className="text-slate-400 text-sm">Visualizing the orchestrations of autonomous neural nodes in real-time.</p>
        </div>
        <div className="flex gap-4">
           {isProcessing && (
              <GlassCard className="px-4 py-2 border-brand-accent/20 flex items-center gap-2">
                 <Activity size={14} className="text-brand-accent animate-spin" />
                 <span className="text-[10px] font-black tracking-widest text-white uppercase">Pipeline Active_</span>
              </GlassCard>
           )}
           <div className="px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Mesh Network Operational</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-3 relative glass-card bg-slate-950/50 border-white/5 overflow-hidden group">
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                 <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                 <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                 </feMerge>
              </filter>
            </defs>
            {connections.map((conn, i) => {
              const from = nodes.find(n => n.id === conn.from)!;
              const to = nodes.find(n => n.id === conn.to)!;
              const isActive = from.status === "COMPLETE" || from.status === "PROCESSING";
              
              return (
                <motion.line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={isActive ? "#38bdf8" : "url(#lineGrad)"}
                  strokeWidth={isActive ? "3" : "1"}
                  strokeOpacity={isActive ? "0.6" : "0.3"}
                  style={{ filter: isActive ? "url(#glow)" : "none" }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: i * 0.2 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.1 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: node.x, top: node.y }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="group/node relative cursor-pointer">
                 {/* Status Pulse */}
                 {node.status === "PROCESSING" && (
                   <div className="absolute -inset-10 bg-blue-500/10 rounded-full animate-ping"></div>
                 )}
                 
                 <div className={`absolute -inset-6 bg-brand-accent/5 rounded-full blur-2xl transition-all ${selectedNode?.id === node.id ? 'bg-brand-accent/20 blur-3xl' : 'group-hover/node:bg-brand-accent/10'}`}></div>
                 
                 <div className={`relative bg-slate-900 border p-5 rounded-[1.5rem] shadow-2xl transition-all group-hover/node:scale-110 ${getStatusColor(node.status)} ${selectedNode?.id === node.id ? 'scale-110 ring-2 ring-brand-accent/30' : ''}`}>
                    <node.icon className={node.color} size={28} />
                    
                    {/* Status Indicator Dot */}
                    <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border border-black/50 ${getStatusDot(node.status)}`}></div>
                 </div>

                 <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                    <p className="text-[11px] font-black tracking-widest text-white uppercase">{node.label}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                       <span className="text-[8px] text-slate-500 font-mono tracking-tight">{node.id}</span>
                       <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                         node.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" :
                         node.status === "COMPLETE" ? "bg-emerald-500/20 text-emerald-400" :
                         "bg-slate-800 text-slate-600"
                       }`}>{node.status}</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}

          {/* Cyber Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 cyber-grid"></div>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="hidden lg:block space-y-6">
           <AnimatePresence mode="wait">
             {selectedNode ? (
               <motion.div
                 key={selectedNode.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="h-full flex flex-col"
               >
                 <GlassCard className="p-6 border-white/5 flex-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                       <selectedNode.icon size={120} />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                       <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl bg-white/[0.03] ${selectedNode.color} border border-white/5 shadow-xl`}>
                             <selectedNode.icon size={32} />
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-white uppercase tracking-tighter">{selectedNode.label}</h3>
                             <p className="text-[10px] text-brand-accent font-mono tracking-widest uppercase">NODE_STATUS::{selectedNode.status}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                             <Info size={12} className="text-brand-accent" /> Description
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                             {selectedNode.description}
                          </p>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                             <Activity size={12} className="text-brand-accent" /> Specifications
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                             <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Abstraction Layer</span>
                                <span className="text-[9px] text-white font-mono">{selectedNode.specs.layer}</span>
                             </div>
                             <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Processing Load</span>
                                <span className="text-[9px] text-white font-mono">{selectedNode.specs.throughput}</span>
                             </div>
                             <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Kernel Engine</span>
                                <span className="text-[9px] text-brand-accent font-mono underline decoration-brand-accent/30">{selectedNode.specs.model}</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                             <Zap size={12} className="text-brand-accent" /> Interactive Actions
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                             <button 
                              onClick={() => handleAction('ping')}
                              className="px-3 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-accent transition-all active:scale-95"
                             >
                               Ping Node
                             </button>
                             <button 
                              onClick={() => handleAction('recalibrate')}
                              className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
                             >
                               Recalibrate
                             </button>
                          </div>
                       </div>
                    </div>
                 </GlassCard>
               </motion.div>
             ) : (
               <div className="h-full">
                 <GlassCard className="h-full p-8 border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-6 bg-slate-900 rounded-full border border-white/5 text-slate-700">
                       <Server size={32} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inspector Inactive</p>
                       <p className="text-[10px] text-slate-600 mt-2">Select a node in the mesh to visualize its parameters.</p>
                    </div>
                 </GlassCard>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Log Stream Section */}
      <div className="h-32 flex flex-col space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2 px-1">
          <Terminal size={12} className="text-brand-accent" /> Agent Telemetry Stream
        </h3>
        <GlassCard className="flex-1 bg-slate-950/80 border-white/5 p-4 relative overflow-hidden font-mono text-[10px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent"></div>
           <div 
            ref={scrollRef}
            className="h-full overflow-y-auto space-y-1.5 custom-scrollbar pr-2"
           >
              {logs.length > 0 ? (
                logs.slice(-20).map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4"
                  >
                    <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                    <span className="text-brand-accent font-bold shrink-0">{log.agent}:</span>
                    <span className="text-slate-400">{log.thought || log.output}</span>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center gap-3 text-slate-600 animate-pulse">
                  <div className="w-1 h-1 bg-brand-accent rounded-full"></div>
                  <span>Awaiting neural pulses from mesh...</span>
                </div>
              )}
           </div>
        </GlassCard>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2);
          border-radius: 10px;
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

