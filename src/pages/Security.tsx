import React, { useState, useEffect, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Terminal, 
  Eye, 
  Lock, 
  Map as MapIcon, 
  ChevronRight, 
  Zap, 
  FileText, 
  Unlock,
  Globe,
  Activity,
  Flag,
  Radio,
  Search,
  Bug,
  Server,
  Database,
  Cpu
} from "lucide-react";
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  Handle, 
  Position 
} from "reactflow";
import "reactflow/dist/style.css";
import { SecurityAlert, AgentLog } from "../types";
import { GlassCard } from "../components/UI";
import { motion, AnimatePresence } from "motion/react";
import { runSecurityScan } from "../services/apiService";

interface Threat {
  id: string;
  type: string;
  origin: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
}

const CyberNode = ({ data }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`px-4 py-3 rounded-xl border backdrop-blur-xl transition-all duration-500 min-w-[140px] relative overflow-hidden ${
        data.vulnerable ? 'bg-rose-500/10 border-rose-500' : 'bg-slate-900/80 border-white/10'
      } ${
        data.isDimmed ? 'opacity-20 blur-[1px] scale-95 grayscale' : 'opacity-100'
      } ${
        data.isHighlighted ? 'ring-2 ring-brand-accent ring-offset-4 ring-offset-slate-950 scale-105 z-50' : ''
      } ${
        data.vulnerable && !data.isDimmed ? 'shadow-[0_0_20px_rgba(244,63,94,0.2)]' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${data.vulnerable ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-brand-accent/10 text-brand-accent'}`}>
          {data.icon || <Server size={14} />}
        </div>
        <div>
          <div className="text-[9px] font-black uppercase text-slate-500 leading-none mb-1">{data.type || 'ASSET'}</div>
          <div className="text-[10px] font-bold text-white tracking-tight uppercase">{data.label}</div>
        </div>
      </div>

      <AnimatePresence>
        {(isHovered || data.isHighlighted) && data.finding && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-48 p-3 bg-slate-900 border border-brand-accent/30 rounded-xl shadow-2xl z-[100] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={10} className="text-rose-500" />
              <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest">Breach Vector</span>
            </div>
            <p className="text-[10px] font-bold text-white mb-1">{data.finding.name}</p>
            <p className="text-[8px] text-slate-400 font-mono leading-tight uppercase">{data.finding.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {data.vulnerable && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-1 right-1"
        >
          <ShieldAlert size={8} className="text-rose-500" />
        </motion.div>
      )}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  cyber: CyberNode
};

export const SecurityPage = ({ alerts, isDefenseMode }: { alerts: SecurityAlert[], isDefenseMode: boolean }) => {
  const [threatFeed, setThreatFeed] = useState<Threat[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanFindings, setScanFindings] = useState<any[]>([]);
  const [aiRemediations, setAiRemediations] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<"timestamp" | "origin">("timestamp");

  const generateAIAdvice = async (finding: any) => {
    setIsAnalyzing(finding.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a NeuralX Cyber-Security Agent. Provide concise, high-technical remediation steps for the detected vulnerability. Format: One brief paragraph followed by 3 bullet points.",
        },
        contents: `Vulnerability: ${finding.name}\nDescription: ${finding.description}\nRisk Score: ${finding.risk}`,
      });
      setAiRemediations(prev => ({ ...prev, [finding.id]: response.text || "No remediation steps could be generated by the cognitive cluster." }));
    } catch (error) {
      console.error("AI Analysis failed", error);
      setAiRemediations(prev => ({ ...prev, [finding.id]: "NEURAL_SYNTHESIS_ERROR: Unable to reach cognitive cluster. Manual remediation advised." }));
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanFindings([]);
    setAiRemediations({});
    
    try {
      // Simulate progress
      const progressSteps = [15, 32, 48, 65, 82, 95];
      for (const step of progressSteps) {
        await new Promise(r => setTimeout(r, 400));
        setScanProgress(step);
      }
      
      const result = await runSecurityScan();
      setScanProgress(100);
      setScanFindings(result.findings);
      setLastScanTime(result.timestamp);
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 500);
    }
  };
  
  // Simulated External Threat Feed Logic
  useEffect(() => {
    const threatTypes = ["DDoS Vector", "SQL Injection Path", "Brute Force Sequence", "Malware C2 Ping", "Shadow Access", "API Scraping"];
    const locations = ["US-EAST-1", "EU-WEST-2", "CN-SHANGHAI", "RU-MOSCOW", "BR-SAO-PAULO", "AU-SYDNEY"];
    const severities: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    const interval = setInterval(() => {
      const newThreat: Threat = {
        id: Math.random().toString(36).substr(2, 9),
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        origin: locations[Math.floor(Math.random() * locations.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setThreatFeed(prev => [newThreat, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const filteredThreats = useMemo(() => {
    let result = [...threatFeed];
    
    if (severityFilter !== "ALL") {
      result = result.filter(t => t.severity === severityFilter);
    }
    
    result.sort((a, b) => {
      if (sortKey === "timestamp") {
        return b.timestamp.localeCompare(a.timestamp);
      } else {
        return a.origin.localeCompare(b.origin);
      }
    });
    
    return result;
  }, [threatFeed, severityFilter, sortKey]);

  const highRiskAlerts = alerts.filter(a => a.riskScore > 10);

  const staticEdges: Edge[] = [
    { id: 'e1', source: 'gateway', target: 'firewall', animated: true },
    { id: 'e2', source: 'firewall', target: 'api' },
    { id: 'e3', source: 'firewall', target: 'web' },
    { id: 'e4', source: 'api', target: 'db' },
    { id: 'e5', source: 'web', target: 'db' },
  ];
  
  const nodes = useMemo(() => {
    const baseNodes: Node[] = [
      { id: 'gateway', type: 'cyber', data: { label: 'PUBLIC_GATEWAY', type: 'INGRESS', icon: <Globe size={14}/>, vulnerable: scanFindings.some(f => f.id === 'VULN-002') }, position: { x: 300, y: 0 } },
      { id: 'firewall', type: 'cyber', data: { label: 'NEURAL_FILTER', type: 'SECURITY', icon: <Lock size={14}/> }, position: { x: 300, y: 80 } },
      { id: 'api', type: 'cyber', data: { label: 'API_CLUSTER', type: 'COMPUTE', icon: <Cpu size={14}/>, vulnerable: scanFindings.some(f => ['VULN-001', 'VULN-003'].includes(f.id)) }, position: { x: 150, y: 180 } },
      { id: 'web', type: 'cyber', data: { label: 'WEB_FE_POOL', type: 'DISPLAY', vulnerable: scanFindings.some(f => f.id === 'VULN-004') }, position: { x: 450, y: 180 } },
      { id: 'db', type: 'cyber', data: { label: 'ENCRYPTED_RDS', type: 'STORAGE', icon: <Database size={14}/> }, position: { x: 300, y: 300 } },
    ];

    return baseNodes.map(node => {
      const isSelected = selectedNodeId === node.id;
      const isRelated = selectedNodeId && staticEdges.some(e => 
        (e.source === selectedNodeId && e.target === node.id) || 
        (e.target === selectedNodeId && e.source === node.id)
      );

      const finding = scanFindings.find(f => {
        if (node.id === 'gateway') return f.id === 'VULN-002';
        if (node.id === 'api') return ['VULN-001', 'VULN-003'].includes(f.id);
        if (node.id === 'web') return f.id === 'VULN-004';
        return false;
      });

      return {
        ...node,
        data: {
          ...node.data,
          finding,
          isHighlighted: isSelected,
          isDimmed: selectedNodeId && !isSelected && !isRelated
        }
      };
    });
  }, [scanFindings, selectedNodeId]);

  const edges = useMemo(() => {
    return staticEdges.map(edge => {
      const isHighlighted = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
      const isDimmed = selectedNodeId && !isHighlighted;

      return {
        ...edge,
        animated: edge.animated || isHighlighted,
        style: { 
          stroke: isHighlighted ? '#38bdf8' : isDimmed ? '#0f172a' : '#1e293b',
          strokeWidth: isHighlighted ? 3 : 1,
          transition: 'all 0.5s ease'
        }
      };
    });
  }, [selectedNodeId]);

  const playbooks = [
    { 
      id: "NIST_IR", 
      title: "Incident Response (NIST 800-61)", 
      steps: ["Vector Analysis", "Automated Containment", "Eradication Pulse", "Recovery Scan"],
      active: highRiskAlerts.length > 0
    },
    { 
      id: "ISO_DATA", 
      title: "Data Integrity Protocol", 
      steps: ["Isolation Trace", "Hash Matching", "Audit Trail Freeze"],
      active: alerts.length > 0
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Threat <span className="text-rose-500">Matrix</span></h1>
          <p className="text-slate-400 mt-1">SOAR-aligned remediation and neural triangulation protocol.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className={`px-4 py-2 rounded-xl flex items-center gap-3 border transition-all ${isScanning ? 'bg-brand-accent/5 border-brand-accent/30 text-brand-accent opacity-50' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-brand-accent/50 hover:text-white'}`}
          >
            {isScanning ? (
              <div className="flex items-center gap-2">
                <Search size={16} className="animate-spin" />
                <span className="text-[10px] font-mono">{scanProgress}%</span>
              </div>
            ) : <ShieldAlert size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {isScanning ? "SCANNING..." : "TRIGGER VULN_SCAN"}
            </span>
          </button>

          <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border transition-all ${isDefenseMode ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
            {isDefenseMode ? <Lock size={16} className="animate-pulse" /> : <Unlock size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {isDefenseMode ? "DEFENSE: ACTIVE" : "DEFENSE: STANDBY"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
           <GlassCard className="relative h-[480px] overflow-hidden bg-slate-950/80 border-slate-800 p-0">
              <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>
              
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-black/60 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-xl">
                 <MapIcon size={12} className="text-brand-accent" /> NETWORK_TOPOLOGY_MONITOR
              </div>

              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onInit={(instance) => instance.fitView()}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => setSelectedNodeId(null)}
                className="bg-transparent"
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#38bdf8" gap={24} size={1} opacity={0.05} />
                <Controls showInteractive={false} className="opacity-20 hover:opacity-100 transition-opacity" />
              </ReactFlow>

              <div className="absolute bottom-6 left-6 z-20 space-y-1">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[9px] font-black font-mono text-rose-500 uppercase">Vulnerable Vectors Detected</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div>
                    <span className="text-[9px] font-black font-mono text-slate-500 uppercase">Active Nodes Verified</span>
                 </div>
              </div>
           </GlassCard>

           {(isScanning || scanFindings.length > 0) && (
             <GlassCard className="p-6 border-brand-accent/20 bg-brand-accent/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <Bug size={140} />
               </div>
               
               <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg bg-brand-accent/10 text-brand-accent ${isScanning ? 'animate-pulse' : ''}`}>
                     <Bug size={18} />
                   </div>
                   <div>
                     <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Vulnerability Audit Report</h3>
                     <p className="text-[9px] text-brand-accent/60 font-mono mt-0.5">
                       {isScanning ? 'SCAN_IN_PROGRESS: Analyzing architectural vectors...' : `AUDIT_COMPLETE: ${scanFindings.length} findings localized.`}
                     </p>
                   </div>
                 </div>
                 {!isScanning && lastScanTime && (
                   <span className="text-[9px] font-mono text-slate-500">TIMESTAMP: {new Date(lastScanTime).toLocaleTimeString()}</span>
                 )}
               </div>

               {isScanning ? (
                 <div className="space-y-6 py-8">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-brand-accent animate-pulse uppercase tracking-[0.2em]">HEURISTIC_ANALYSIS_IN_PROGRESS</span>
                      <span className="text-[14px] font-black font-mono text-brand-accent">{scanProgress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${scanProgress}%` }}
                       className="h-full bg-brand-accent shadow-[0_0_10px_#38bdf8]"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="h-12 bg-white/[0.02] border border-white/5 rounded-lg flex items-center px-4 gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping"></div>
                          <div className="h-2 w-24 bg-white/10 rounded animate-pulse"></div>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <AnimatePresence>
                     {scanFindings.map((finding, idx) => (
                       <motion.div
                         key={finding.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         className="p-4 bg-black/40 border border-brand-accent/10 rounded-xl group hover:border-brand-accent/30 transition-all flex flex-col min-h-[140px]"
                       >
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${finding.risk > 8 ? 'bg-rose-500' : finding.risk > 5 ? 'bg-orange-500' : 'bg-brand-accent'}`}></div>
                              <span className="text-[10px] font-black font-mono text-white tracking-tighter uppercase">{finding.id}</span>
                            </div>
                            <div className="text-[10px] font-black text-rose-500 font-mono italic">
                              RISK: {finding.risk.toFixed(1)}
                            </div>
                         </div>
                         <h4 className="text-[11px] font-black text-white/90 uppercase tracking-wide mb-1">{finding.name}</h4>
                         <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tight mb-4">
                           {finding.description}
                         </p>

                         {aiRemediations[finding.id] ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-3 bg-brand-accent/5 border border-brand-accent/10 rounded-lg text-[9px] text-slate-300 font-mono whitespace-pre-wrap relative overflow-hidden"
                            >
                               <div className="absolute top-0 right-0 p-1 bg-brand-accent/10 text-brand-accent text-[6px] font-black tracking-widest uppercase">Cognitive Result</div>
                               <div className="text-[8px] font-black text-brand-accent mb-2 uppercase tracking-widest border-b border-brand-accent/20 pb-1 flex items-center gap-1">
                                 <Zap size={10} /> Neural remediation
                               </div>
                               {aiRemediations[finding.id]}
                            </motion.div>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); generateAIAdvice(finding); }}
                              disabled={isAnalyzing === finding.id}
                              className="mt-auto px-3 py-1.5 bg-brand-accent/10 border border-brand-accent/30 rounded-lg text-[9px] font-black text-brand-accent uppercase tracking-widest hover:bg-brand-accent hover:text-brand-bg transition-all flex items-center justify-center gap-2"
                            >
                              {isAnalyzing === finding.id ? (
                                <>
                                  <Activity size={10} className="animate-spin" />
                                  Synthesizing...
                                </>
                              ) : (
                                <>
                                  <Zap size={10} />
                                  Neural Remediation
                                </>
                              )}
                            </button>
                          )}
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
               )}
             </GlassCard>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 px-1">
                    <Zap size={14} className="text-brand-accent" /> Neural Playbooks
                  </h3>
                  <div className="space-y-3">
                    {playbooks.map((book) => (
                      <GlassCard key={book.id} className={`p-5 transition-all duration-700 ${book.active ? 'border-brand-accent/20 bg-brand-accent/5' : 'opacity-30 grayscale'}`}>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{book.title}</h4>
                          {book.active && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></div>}
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                           {book.steps.map((step, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black">{idx + 1}</div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{step}</span>
                             </div>
                           ))}
                        </div>
                        {book.active && (
                          <button className="w-full mt-5 py-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent hover:text-brand-bg transition-all">
                            TRIGGER PROTOCOL
                          </button>
                        )}
                      </GlassCard>
                    ))}
                  </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 px-1">
                    <Terminal size={14} className="text-brand-accent" /> Security Infrastructure
                 </h3>
                 <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 glass-card bg-slate-900/50 border-white/5 rounded-2xl">
                       <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
                          <Lock size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Post-Quantum Crypt</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">FIPS 140-3 COMPLIANT</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 glass-card bg-slate-900/50 border-white/5 rounded-2xl">
                       <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                          <Eye size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Behavioral Heuristics</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">LEARNING_CYCLES: 1,204</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Threat Intelligence Feed Section */}
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 px-1">
                <Globe size={14} className="text-brand-accent" /> External Threat Intelligence
              </h3>
              <GlassCard className="p-6 border-white/5 bg-slate-900/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                   <Globe size={180} />
                </div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE_UPSTREAM_FEED</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                      {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map(sev => (
                        <button
                          key={sev}
                          onClick={() => setSeverityFilter(sev)}
                          className={`px-2 py-1 rounded text-[8px] font-black transition-all ${severityFilter === sev ? 'bg-brand-accent text-brand-bg shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                    <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                      <button
                        onClick={() => setSortKey("timestamp")}
                        className={`px-2 py-1 rounded text-[8px] font-black transition-all ${sortKey === "timestamp" ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        TIME
                      </button>
                      <button
                        onClick={() => setSortKey("origin")}
                        className={`px-2 py-1 rounded text-[8px] font-black transition-all ${sortKey === "origin" ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        LOC
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 min-h-[220px] relative z-10">
                  <AnimatePresence mode="popLayout">
                    {filteredThreats.map((threat) => (
                      <motion.div
                        key={threat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                        className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            threat.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' :
                            threat.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                            threat.severity === 'MEDIUM' ? 'bg-brand-accent/10 text-brand-accent' :
                            'bg-slate-500/10 text-slate-500'
                          }`}>
                            <Radio size={14} className={threat.severity === 'CRITICAL' ? 'animate-pulse' : ''} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-[10px] font-black uppercase text-white tracking-widest">{threat.type}</h4>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                threat.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' :
                                threat.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                threat.severity === 'MEDIUM' ? 'bg-brand-accent/10 text-brand-accent' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>
                                {threat.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                                <Flag size={8} /> {threat.origin}
                              </span>
                              <span className="text-slate-700 text-[9px]">•</span>
                              <span className="text-[9px] text-slate-500 font-mono">{threat.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={14} className="text-slate-600" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-medium text-slate-600 uppercase tracking-[0.2em] relative z-10">
                   <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Activity size={10} /> LATENCY: 42ms</span>
                      <span className="flex items-center gap-1 text-slate-500"><Terminal size={10} /> PACKET_TICK: 4.0s</span>
                   </div>
                   <div className="text-brand-accent/40 font-mono">CONNECTION_SECURED</div>
                </div>
              </GlassCard>
           </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 px-1">Forensic Ledger</h3>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={alert.id}
                  layout
                >
                  <GlassCard 
                    onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                    className={`p-4 border-l-2 relative group overflow-hidden cursor-pointer transition-all ${
                      alert.riskScore > 10 ? "border-l-rose-500 bg-rose-500/5" : "border-l-brand-accent bg-slate-900/30"
                    } ${expandedAlertId === alert.id ? 'border-brand-accent shadow-[0_0_20px_rgba(56,189,248,0.1)]' : ''}`}
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10 blur-sm group-hover:blur-none transition-all">
                       <FileText size={40} />
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div className="flex items-center gap-2">
                        {alert.riskScore > 10 ? (
                          <ShieldAlert className="text-rose-500" size={14} />
                        ) : (
                          <ShieldCheck className="text-brand-accent" size={14} />
                        )}
                        <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${
                          alert.riskScore > 10 ? "text-rose-500" : "text-brand-accent"
                        }`}>
                          {alert.riskScore > 10 ? 'VULN_FOUND' : 'INFO_TRACE'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3 pr-6 relative z-10">{alert.message}</p>
                    
                    <AnimatePresence>
                      {expandedAlertId === alert.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-3 space-y-4 pt-4 border-t border-white/5"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Detailed Timestamp</p>
                              <p className="text-[10px] font-mono text-brand-accent">{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Subject Vector (UID)</p>
                              <p className="text-[10px] font-mono text-brand-accent">{alert.userId || "SYSTEM_DAEMON"}</p>
                            </div>
                          </div>

                          {alert.logs && alert.logs.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Cognitive Audit Logs</p>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {alert.logs.map((log, lIdx) => (
                                  <div key={lIdx} className="p-2 bg-black/40 rounded border border-white/5 text-[9px]">
                                    <div className="flex justify-between text-[8px] mb-1">
                                      <span className="font-black text-brand-accent">{log.agent}</span>
                                      <span className="text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-400 font-mono italic">THOUGHT: {log.thought}</p>
                                    <p className="text-slate-300 font-bold mt-1">RUN_RESULT: {log.output}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-2 bg-brand-accent/10 border border-brand-accent/20 rounded-lg">
                            <p className="text-[8px] font-black uppercase text-brand-accent tracking-widest mb-1">Remediation Status</p>
                            <p className="text-[10px] text-brand-accent/80 font-bold">Awaiting Manual Triage Protocol Alpha</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between text-[10px] relative z-10">
                      <div className="flex items-center gap-2">
                         <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${alert.riskScore > 10 ? "bg-rose-500 shadow-[0_0_5px_#f43f5e]" : "bg-brand-accent"}`}
                              style={{ width: `${Math.min(alert.riskScore * 5, 100)}%` }}
                            ></div>
                         </div>
                         <span className="text-slate-500 font-mono italic">RISK: {alert.riskScore.toFixed(1)}</span>
                      </div>
                      <ChevronRight size={12} className={`text-slate-700 transition-all ${expandedAlertId === alert.id ? 'rotate-90 text-brand-accent' : 'group-hover:text-brand-accent'}`} />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-600 space-y-4">
                 <ShieldCheck className="mx-auto opacity-10" size={60} />
                 <p className="text-[10px] uppercase font-black tracking-[0.3em] font-mono">Stream Synchronized</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
