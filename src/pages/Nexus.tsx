import { useState } from "react";
import { BrainCircuit, Cpu, Play, CheckCircle2, AlertCircle, Layers, Settings2, Database } from "lucide-react";
import { GlassCard } from "../components/UI";
import { auth, db, handleFirestoreError } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { OperationType } from "../types";
import { retrainModel } from "../services/apiService";

export const NexusPage = () => {
  const [modelType, setModelType] = useState<"ML" | "Security">("ML");
  const [status, setStatus] = useState<"idle" | "training" | "completed" | "failed">("idle");
  const [progress, setProgress] = useState(0);
  const [dataset, setDataset] = useState("Corporate_Traffic_V5.csv");
  const [epochs, setEpochs] = useState(10);
  const [learningRate, setLearningRate] = useState(0.001);

  const startTraining = async () => {
    if (!auth.currentUser) return;
    
    setStatus("training");
    setProgress(0);
    
    try {
      const result = await retrainModel(modelType, { epochs, learningRate, dataset });
      const { sessionId } = result;
      
      // Log to Firestore
      const path = 'training_sessions';
      try {
        await addDoc(collection(db, path), {
          sessionId,
          modelType,
          status: "processing",
          datasetName: dataset,
          parameters: { epochs, learningRate },
          userId: auth.currentUser.uid,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

      // Simulate UI progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus("completed");
            return 100;
          }
          return prev + 5;
        });
      }, 300);
      
    } catch (err) {
      console.error(err);
      setStatus("failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-accent/10 rounded-2xl border border-brand-accent/20">
          <Cpu className="text-brand-accent" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Nexus <span className="text-brand-accent">Retrain</span></h1>
          <p className="text-slate-400">Parameter tuning and weight recalibration for predictive agents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8">
            <div className="flex gap-4 mb-8">
               <button 
                onClick={() => setModelType("ML")}
                className={`flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all ${modelType === "ML" ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"}`}
               >
                 <BrainCircuit size={20} />
                 <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-widest">Predictive Logic</p>
                    <p className="text-[10px] opacity-60">Neural Network Recalibration</p>
                 </div>
               </button>
               <button 
                onClick={() => setModelType("Security")}
                className={`flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all ${modelType === "Security" ? "bg-rose-500/10 border-rose-500 text-rose-500" : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"}`}
               >
                 <Cpu size={20} />
                 <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-widest">Anomaly Guard</p>
                    <p className="text-[10px] opacity-60">Isolation Forest Updates</p>
                 </div>
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Database size={12} /> Target Dataset
                  </label>
                  <select 
                    value={dataset}
                    onChange={(e) => setDataset(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:border-brand-accent outline-none"
                  >
                    <option>Corporate_Traffic_V5.csv</option>
                    <option>Ingested_Stream_AX.csv</option>
                    <option>Historical_Behaviors_2024.csv</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layers size={12} /> Epoch Count
                  </label>
                  <input 
                    type="range" min="1" max="100" 
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value))}
                    className="w-full accent-brand-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>1</span>
                    <span className="text-brand-accent">{epochs} Epochs</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Settings2 size={12} /> Learning Rate
                  </label>
                  <select 
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:border-brand-accent outline-none"
                  >
                    <option value={0.1}>0.1 (Aggressive)</option>
                    <option value={0.01}>0.01 (Standard)</option>
                    <option value={0.001}>0.001 (Precise)</option>
                    <option value={0.0001}>0.0001 (Micro)</option>
                  </select>
                </div>
                <div className="pt-4">
                   <button 
                    disabled={status === "training"}
                    onClick={startTraining}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all ${status === "training" ? "bg-slate-800 text-slate-500 opacity-50" : "bg-brand-accent text-brand-bg hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-accent/20"}`}
                   >
                     <Play size={20} />
                     Initiate Retrain
                   </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {status !== "idle" && (
            <GlassCard className={`p-6 border-l-4 ${status === "completed" ? "border-l-emerald-500" : status === "failed" ? "border-l-rose-500" : "border-l-brand-accent"}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  {status === "training" ? (
                    <div className="w-5 h-5 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin"></div>
                  ) : status === "completed" ? (
                    <CheckCircle2 className="text-emerald-500" />
                  ) : (
                    <AlertCircle className="text-rose-500" />
                  )}
                  <span className="font-bold uppercase tracking-widest text-sm">
                    {status === "training" ? "Orchestrating Weights..." : status === "completed" ? "Training Cycle Finalized" : "Sequence Error"}
                  </span>
                </div>
                <span className="font-mono text-sm text-slate-500">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${status === "completed" ? "bg-emerald-500" : status === "failed" ? "bg-rose-500" : "bg-brand-accent shadow-[0_0_10px_#38bdf8]"}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                 <div className="bg-white/5 p-2 rounded text-center">
                    <p className="text-[8px] text-slate-500 uppercase">Loss Score</p>
                    <p className="text-xs font-mono text-white">0.024</p>
                 </div>
                 <div className="bg-white/5 p-2 rounded text-center">
                    <p className="text-[8px] text-slate-500 uppercase">Accuracy</p>
                    <p className="text-xs font-mono text-white">99.8%</p>
                 </div>
                 <div className="bg-white/5 p-2 rounded text-center">
                    <p className="text-[8px] text-slate-500 uppercase">Time</p>
                    <p className="text-xs font-mono text-white">1.2s</p>
                 </div>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Retrain Analytics</h3>
          <GlassCard className="space-y-6">
            <div className="relative">
               <div className="absolute inset-0 bg-brand-accent/5 rounded-full blur-2xl"></div>
               <div className="relative flex flex-col items-center">
                  <span className="text-5xl font-black text-white">94</span>
                  <span className="text-[10px] text-brand-accent font-bold uppercase tracking-widest">Model Drift Index</span>
               </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed text-center italic">
              "Continuous learning is active. Baseline performance remains within optimal threshold for 14,204 rows."
            </p>
            <div className="space-y-3 pt-4 border-t border-white/5">
               <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Last Sync</span>
                  <span className="text-slate-300">14:02:11</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Agent Version</span>
                  <span className="text-brand-accent">V5.4.1</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Hash State</span>
                  <span className="text-slate-300 font-mono">B04F...89A</span>
               </div>
            </div>
          </GlassCard>
          
          <GlassCard className="bg-rose-500/5 border-rose-500/20">
            <div className="flex items-center gap-3 text-rose-500 mb-2">
              <AlertCircle size={16} />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Critical Override</h4>
            </div>
            <p className="text-[10px] text-slate-400">
              Only Level 4 users can perform manual weight overrides. All retraining operations are logged to kernel history.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
