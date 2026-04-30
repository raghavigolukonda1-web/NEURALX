import { motion } from "motion/react";
import { BrainCircuit } from "lucide-react";

export const HomePage = ({ setActivePage }: any) => (
    <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center space-y-12 animate-in zoom-in-95 duration-700">
        <div className="relative">
            <div className="absolute -inset-20 bg-brand-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-brand-accent/20 rounded-full scale-125"
            ></motion.div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] relative z-10 shadow-2xl">
                <BrainCircuit size={80} className="text-brand-accent" />
            </div>
        </div>
        
        <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">
                THE NEXT <span className="text-brand-accent animate-pulse">DIMENSION</span> OF SECURITY
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
                Autonomous multi-agent orchestration for cyber defense and deep data analytics. 
                Experience the convergence of intelligence and security.
            </p>
        </div>

        <div className="flex gap-4">
            <button 
                onClick={() => setActivePage("upload")}
                className="px-8 py-4 bg-brand-accent text-brand-bg font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-brand-accent/20 uppercase tracking-widest"
            >
                Start Ingestion
            </button>
            <button 
                onClick={() => setActivePage("dashboard")}
                className="px-8 py-4 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
                View Surveillance
            </button>
        </div>
    </div>
);
