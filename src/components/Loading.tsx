import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Cpu, ShieldAlert, Activity, Lock } from "lucide-react";

export const NeuralBootSequence = ({ onComplete }: { onComplete?: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "KERNEL_INIT_V4.2.0",
    "DECRYPTING_NEURAL_SYNAPSE",
    "SYNCHRONIZING_DISTRIBUTED_CORES",
    "SECURE_HANDSHAKE_ESTABLISHED",
    "UPLOADING_CONSCIOUSNESS_ARRAY",
    "ACCESS_GRANTED_BY_KERNEL"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-8 bg-brand-accent/20 blur-3xl rounded-full"
            ></motion.div>
            <div className="relative bg-slate-900 border border-brand-accent/30 p-6 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.2)]">
              <BrainCircuit size={48} className="text-brand-accent animate-pulse" />
            </div>
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">Neural Initialization</span>
                <span className="text-[14px] font-black font-mono text-brand-accent">
                  {Math.round(((step + 1) / steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  className="h-full bg-brand-accent shadow-[0_0_15px_#38bdf8]"
                />
              </div>
            </div>

            <div className="h-20 bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] overflow-hidden flex flex-col justify-end">
              <AnimatePresence mode="popLayout">
                {steps.slice(0, step + 1).map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-2 ${i === step ? 'text-brand-accent' : 'text-slate-600'}`}
                  >
                    <span className="opacity-50">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span className="font-bold">{s}</span>
                    {i === step && <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>_</motion.span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col">
    {/* Navbar Skeleton */}
    <div className="h-16 border-b border-white/5 bg-slate-900/50 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-white/5 animate-pulse"></div>
        <div className="w-32 h-4 bg-white/5 rounded animate-pulse"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-8 rounded bg-white/5 animate-pulse"></div>
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse"></div>
      </div>
    </div>

    <div className="flex flex-1">
      {/* Sidebar Skeleton */}
      <div className="w-60 border-r border-white/5 bg-slate-900/40 p-6 space-y-8">
        <div className="space-y-3">
          <div className="w-20 h-2 bg-white/5 rounded animate-pulse mb-6"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-full h-10 bg-white/5 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="w-24 h-2 bg-white/5 rounded animate-pulse mb-6"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full h-4 bg-white/5 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-8 cyber-grid opacity-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-4">
              <div className="w-64 h-8 bg-white/5 rounded animate-pulse"></div>
              <div className="w-96 h-4 bg-white/5 rounded animate-pulse"></div>
            </div>
            <div className="w-40 h-10 bg-white/5 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[400px] bg-white/5 border border-white/5 rounded-2xl animate-pulse"></div>
            <div className="h-[400px] bg-white/5 border border-white/5 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const AuthSkeleton = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 cyber-grid">
    <div className="max-w-md w-full glass-card p-12 text-center space-y-8 animate-pulse">
       <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 bg-white/5 rounded-3xl"></div>
       </div>
       
       <div className="space-y-4 flex flex-col items-center">
         <div className="w-48 h-10 bg-white/5 rounded"></div>
         <div className="w-32 h-4 bg-white/5 rounded"></div>
       </div>

       <div className="w-full h-14 bg-white/5 rounded-xl mt-8"></div>
       
       <div className="pt-8 border-t border-white/5">
          <div className="w-64 h-2 bg-white/5 rounded mx-auto"></div>
       </div>
    </div>
  </div>
);
