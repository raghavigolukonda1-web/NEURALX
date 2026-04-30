import React, { useState, useRef } from "react";
import { Upload, ShieldAlert, BrainCircuit, Cpu, FileUp, Activity, Database, AlertCircle, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { auth } from "../services/firebase";
import { GlassCard } from "../components/UI";
import { motion } from "motion/react";

export const UploadPage = ({ onDataUpload, isProcessing, setIsProcessing }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      await onDataUpload(file);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const industries = [
    { title: "Risk Management", icon: <Database className="text-brand-accent" />, desc: "Transaction fraud & credit profiling." },
    { title: "Cyber-Forensics", icon: <ShieldAlert className="text-rose-500" />, desc: "Log anomaly & traffic deviation." },
    { title: "Industrial IoT", icon: <Cpu className="text-emerald-500" />, desc: "Sensor telemetry & failure prediction." }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in zoom-in duration-700 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Enterprise <span className="text-brand-accent">Ingestion</span></h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">Deploy high-entropy datasets into our multi-agent neural network for real-time forensic triangulation and risk mapping.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all cursor-pointer group relative overflow-hidden ${
              file ? "border-brand-accent bg-brand-accent/5" : "border-white/5 hover:border-white/10 bg-slate-900/10"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/1" />
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform">
                <FileUp size={32} className={file ? "text-brand-accent" : "text-slate-500"} />
              </div>
              
              {file ? (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-2">
                  <p className="text-lg font-black text-white uppercase tracking-tight">{file.name}</p>
                  <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">{(file.size / 1024).toFixed(1)} KB • BUFFER_READY</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-300 font-bold uppercase tracking-widest text-sm">Initialize Data Stream</p>
                  <p className="text-slate-600 text-[10px] font-mono leading-relaxed">Drag forensic CSV source or click to browse securely.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            disabled={!file || isProcessing}
            onClick={handleUpload}
            className={`w-full py-5 rounded-2xl font-black tracking-[0.3em] text-xs uppercase transition-all shadow-2xl ${
              file && !isProcessing 
                ? "bg-brand-accent text-brand-bg hover:bg-cyan-400 shadow-brand-accent/20" 
                : "bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-brand-bg/30 border-t-brand-bg rounded-full animate-spin"></div>
                EXECUTING PIPELINE...
              </span>
            ) : "Initialize Forensic Scan"}
          </button>
        </div>

        <div className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2 px-2">
             <Activity size={12} className="text-brand-accent" /> Analysis Presets
           </h3>
           
           <div className="space-y-3">
             {industries.map((ind, i) => (
               <GlassCard key={i} className="p-5 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer group transition-all">
                 <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-950 rounded-xl group-hover:bg-brand-accent/10 transition-colors">
                      {ind.icon}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{ind.title}</h4>
                      <p className="text-[9px] text-slate-600 mt-1.5 leading-relaxed font-medium">{ind.desc}</p>
                    </div>
                 </div>
               </GlassCard>
             ))}
           </div>

           <GlassCard className="p-6 border-slate-800 bg-slate-900/20">
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <AlertCircle size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Compliance Protocol</span>
              </div>
              <p className="text-[9px] text-slate-600 leading-relaxed font-mono">
                NeuralX operates on zero-knowledge vector clusters. All identifying PII is discarded during normalized ingestion.
              </p>
           </GlassCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-12 pt-8 opacity-40 grayscale">
         <div className="flex items-center gap-2 font-black text-xs text-slate-500"><ShieldAlert size={16}/> AES-256</div>
         <div className="flex items-center gap-2 font-black text-xs text-slate-500"><BrainCircuit size={16}/> NEURAL_V4</div>
         <div className="flex items-center gap-2 font-black text-xs text-slate-500"><FileSpreadsheet size={16}/> ISO_27001</div>
      </div>
    </div>
  );
};
