import React, { useState, useEffect } from "react";
import { BrainCircuit, Terminal, ChevronDown, ChevronUp, Cpu, Zap, Activity, Info, AlertCircle, Database, ShieldAlert, Brain } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { GlassCard } from "../components/UI";
import { AnalysisResult, AgentLog } from "../types";
import { auth } from "../services/firebase";
import { getCompliance } from "../services/apiService";

const CognitionStep: React.FC<{ log: AgentLog }> = ({ log }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/30 transition-all hover:bg-slate-900/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 px-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${log.agent.includes("Security") ? "bg-rose-500/10 text-rose-500" : "bg-brand-accent/10 text-brand-accent"}`}>
            {log.agent.includes("Security") ? <AlertCircle size={16} /> : <Cpu size={16} />}
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{log.agent}</p>
            <p className="text-xs font-bold text-white">{log.output.slice(0, 60)}...</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-2 space-y-4 bg-black/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-brand-accent uppercase tracking-tighter">1. Raw Input</span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-white/5 font-mono text-[10px] text-slate-400">
                    {log.input}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">2. Cognitive Thought</span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/10 font-mono text-[10px] text-emerald-100/70 italic">
                    {log.thought}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-brand-accent uppercase tracking-tighter">3. Final Output</span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-brand-accent/20 font-mono text-[10px] text-brand-accent">
                    {log.output}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const InsightsPage = ({ analysisResult }: { analysisResult: AnalysisResult | null }) => {
  const [compliance, setCompliance] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const generateAiCognitiveSummary = async () => {
    if (!analysisResult) return;
    setIsSynthesizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are the NeuralX Analytical Synthesis Engine. Provide a high-level, technical, and strategic summary of the current dataset analysis. Focus on the core summary, risk level, and anomalies found. Use professional, futuristic, and cyberpunk-tinged terminology. Max 2 paragraphs."
        },
        contents: `Baseline Analysis Summary: ${analysisResult.summary}\nRisk Score: ${analysisResult.riskScore}\nAnomalies Detected: ${(analysisResult.anomalies || []).length}\nPredictions Count: ${(analysisResult.predictions || []).length}`
      });
      setAiSummary(result.text || "Cognitive synchronization returned null subspace data.");
    } catch (error) {
      console.error("AI Summary generation failed", error);
      setAiSummary("SYNTHESIS_INTERRUPTED: Neural bridge resonance failure. Static analysis fallback only.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (analysisResult && !aiSummary) {
      generateAiCognitiveSummary();
    }
  }, [analysisResult]);

  useEffect(() => {
    const fetchCompliance = async (retries = 3) => {
      try {
        const data = await getCompliance();
        setCompliance(data);
      } catch (e) {
        console.error("Compliance fetch failed", e);
        if (retries > 0) {
          console.log(`Retrying compliance fetch... (${retries} attempts left)`);
          setTimeout(() => fetchCompliance(retries - 1), 2500);
        }
      }
    };
    
    const bootTimer = setTimeout(() => {
      fetchCompliance();
    }, 3000);

    return () => clearTimeout(bootTimer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-brand-accent/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="relative p-4 bg-brand-bg rounded-3xl border border-brand-accent/20 mb-6 neon-glow">
            <BrainCircuit className="text-brand-accent" size={48} />
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Cognitive <span className="text-brand-accent">Intel</span></h1>
        <p className="text-slate-400 max-w-xl text-sm">Autonomous synthesis and multi-agent decision mirroring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-6 border-brand-accent/20 bg-brand-accent/5 relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12">
                    <Brain size={120} />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-brand-accent/10 text-brand-accent ${isSynthesizing ? 'animate-pulse' : ''}`}>
                        <Brain size={20} />
                      </div>
                      <div>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Neural Cognitive Summary</h3>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping"></span>
                           <span className="text-[8px] text-brand-accent/60 font-mono uppercase tracking-[0.2em]">SYNTHESIS_ACTIVE</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={generateAiCognitiveSummary}
                      disabled={isSynthesizing}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-brand-accent transition-all group"
                      title="Regenerate Synthesis"
                    >
                      <Zap size={16} className={`${isSynthesizing ? 'animate-spin' : 'group-hover:scale-110'}`} />
                    </button>
                  </div>
                  
                  <div className="text-[11px] text-slate-300 font-mono leading-relaxed max-w-4xl relative z-10 min-h-[60px]">
                    {isSynthesizing ? (
                      <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-brand-accent/10 rounded animate-pulse"></div>
                        <div className="h-2 w-1/2 bg-brand-accent/10 rounded animate-pulse"></div>
                        <div className="h-2 w-2/3 bg-brand-accent/10 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      aiSummary || "Initiating neural link for cognitive synthesis..."
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <GlassCard className="p-10 border-brand-accent/10 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 opacity-5 rotate-12">
                <BrainCircuit size={400} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-brand-accent uppercase tracking-[0.2em] font-bold text-xs">
                    <Terminal size={14} />
                    EXECUTIVE_INTELLIGENCE_REPORT
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full">
                  <Activity size={10} className="text-brand-accent animate-pulse" />
                  <span className="text-[8px] font-black text-brand-accent uppercase">Live Synthesis</span>
                </div>
              </div>

              {analysisResult ? (
                <div className="text-lg text-slate-200 whitespace-pre-wrap font-serif italic selection:bg-brand-accent selection:text-brand-bg leading-relaxed">
                  {analysisResult.summary}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 opacity-30 text-center">
                  <Database size={48} className="mb-4" />
                  <p className="italic text-sm">Pipeline idle. Initiate data flow to generate cognitive synthesis.</p>
                </div>
              )}
              
              {analysisResult && (
                <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-accent flex items-center gap-2">
                      <Zap size={12} /> Strategic Directives
                    </h4>
                    <ul className="text-[11px] space-y-2 text-slate-400">
                      <li className="flex gap-2">
                        <span className="text-brand-accent">01.</span>
                        <span>Isolate anomalous clusters in segment 5-A</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-brand-accent">02.</span>
                        <span>Recalibrate ML weights for seasonal drift</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-brand-accent">03.</span>
                        <span>Verify integrity of decision hashes</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-end items-end space-y-1">
                      <span className="text-[9px] text-slate-600 font-mono">KERNEL_ID: {analysisResult.riskScore > 50 ? "AUTH_REQD" : "STABLE"}</span>
                      <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">TS: {new Date().toLocaleTimeString()} :: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {analysisResult?.cognitivePath && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Info size={14} className="text-brand-accent" /> Cognitive Decision Matrix
              </h3>
              <div className="space-y-3">
                {analysisResult.cognitivePath.map((log, i) => (
                  <CognitionStep key={i} log={log} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <GlassCard className="p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                 <Activity size={14} className="text-emerald-500" /> Synapse Stream
              </h3>
              <div className="space-y-4">
                 {[1, 2, 3, 4].map((_, i) => (
                   <div key={i} className="relative h-2 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ 
                          left: ["-100%", "100%"],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 2 + i, 
                          repeat: Infinity, 
                          ease: "linear",
                          delay: i * 0.5
                        }}
                        className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent"
                      ></motion.div>
                   </div>
                 ))}
                 <p className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest mt-4">
                   Active Intelligence Pooling...
                 </p>
              </div>
           </GlassCard>

           <GlassCard className="p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                 <ShieldAlert size={14} className="text-brand-accent" /> Compliance & Auditing
              </h3>
              <div className="space-y-3">
                 {compliance ? Object.entries(compliance).map(([key, val]: [string, any]) => (
                   <div key={key} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tighter">{key}</p>
                        <p className="text-[8px] text-slate-500 font-mono mt-0.5">
                          {val.lastAudit ? `LAST_AUDIT: ${val.lastAudit}` : val.nextAudit ? `NEXT_AUDIT: ${val.nextAudit}` : `PROGRESS: ${val.completion}%`}
                        </p>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${val.status === 'COMPLIANT' || val.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-accent/10 text-brand-accent'}`}>
                        {val.status}
                      </span>
                   </div>
                 )) : (
                   <div className="py-4 text-center text-[10px] text-slate-600 animate-pulse">
                     CONTACTING COMPLIANCE_KERNEL...
                   </div>
                 )}
              </div>
           </GlassCard>

           <GlassCard className="p-6 border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center gap-3 text-rose-500 mb-2 font-black uppercase tracking-tighter text-sm">
                 <AlertCircle size={18} /> Zero-Trust Protocol
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Every decision rendered by NEURALX is hashed and verified against the kernel security baseline. Discrepancies trigger a hard-stop on all automation branches.
              </p>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};
