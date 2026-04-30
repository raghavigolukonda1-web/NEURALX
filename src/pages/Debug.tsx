import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { AgentLog } from "../types";

export const DebugPage = ({ logs }: { logs: AgentLog[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Kernel <span className="text-brand-accent">Terminal</span></h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Stream</span>
        </div>
      </div>

      <div className="flex-1 glass-card bg-slate-950 p-0 overflow-hidden border-slate-800 flex flex-col font-mono">
        <div className="bg-slate-900/80 px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">bash --neuralx-orchestrator</span>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide"
        >
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
              <Terminal size={48} className="mb-4" />
              <p className="text-sm">Waiting for pipeline initialization...</p>
              <p className="text-[10px] mt-1">Start upload to trigger agent sequences.</p>
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="space-y-2 border-l border-slate-800 pl-4 py-1 hover:border-brand-accent transition-colors">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-brand-accent font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-emerald-400 font-bold uppercase">{log.agent}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Thought Process</p>
                  <p className="text-xs text-slate-300 italic">"{log.thought}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Output Data</p>
                  <p className="text-xs text-brand-accent">{log.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
