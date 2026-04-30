import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Upload, 
  BrainCircuit, 
  Terminal, 
  Home as HomeIcon,
  Bell,
  Cpu,
  Activity,
  Zap,
  ChevronRight,
  Search,
  Settings,
  User,
  MoreVertical,
  X,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import Papa from "papaparse";
import { io, Socket } from "socket.io-client";
import { AgentLog, SecurityAlert, PageId, OperationType, TelemetryData } from "./types";
import { AgentEngine } from "./services/agentEngine";
import { auth, signIn, signOutUser } from "./services/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { analyzeCSV, getTelemetry } from "./services/apiService";

import { DashboardPage } from "./pages/Dashboard";
import { UploadPage } from "./pages/Upload";
import { DebugPage } from "./pages/Debug";
import { AgentsPage } from "./pages/Agents";
import { SecurityPage } from "./pages/Security";
import { InsightsPage } from "./pages/Insights";
import { HomePage } from "./pages/Home";
import { NexusPage } from "./pages/Nexus";
import { GlassCard, StatCard } from "./components/UI";
import { NeuralBootSequence, DashboardSkeleton, AuthSkeleton } from "./components/Loading";

const Navbar = ({ activePage, setActivePage, alerts, user, isDefenseMode, setIsDefenseMode }: any) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <nav className={`h-16 border-b flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-500 ${isDefenseMode ? 'bg-rose-950/20 border-rose-500/50' : 'glass border-white/5'}`}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage("home")}>
        <div className={`w-8 h-8 rounded flex items-center justify-center transition-all ${isDefenseMode ? 'bg-rose-600 shadow-[0_0_20px_#e11d48]' : 'bg-brand-accent shadow-[0_0_15px_rgba(56,189,248,0.4)]'}`}>
          <span className="text-brand-bg font-black text-xl">N</span>
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">NEURAL<span className={isDefenseMode ? 'text-rose-500' : 'text-brand-accent'}>X</span></span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Security Mode:</span>
            <button 
              onClick={() => setIsDefenseMode(!isDefenseMode)}
              className={`px-2 py-1 rounded border transition-all ${isDefenseMode ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              {isDefenseMode ? 'LOCKDOWN ACTIVE' : 'STANDARD MONITORING'}
            </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotification(!showNotification)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isDefenseMode ? 'bg-rose-900/30 border-rose-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${alerts.length > 0 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-emerald-500 shadow-[0_0_8px_#10b981]"}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${alerts.length > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {alerts.length} Detected
            </span>
          </button>
          
          <AnimatePresence>
            {showNotification && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-80 glass-card p-4 z-50 border border-slate-800"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-brand-accent">Sec-Alerts</h3>
                  <X size={16} className="cursor-pointer" onClick={() => setShowNotification(false)} />
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No active threats detected.</p>
                  ) : (
                    alerts.map((alert: any) => (
                      <div key={alert.id} className={`p-3 bg-slate-900/50 rounded-lg border-l-2 ${alert.riskScore > 10 ? 'border-rose-500' : 'border-amber-500'}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold pr-2">{alert.message}</p>
                          <span className="text-[9px] font-black font-mono text-rose-500">{alert.riskScore}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-accent to-blue-600 flex items-center justify-center border border-white/20 overflow-hidden"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" />
            ) : (
              <User size={16} className="text-white" />
            )}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-48 glass-card p-2 z-50 border border-slate-800"
              >
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.displayName || "Agent"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={() => signOutUser()}
                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                >
                  Terminate Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = ({ activePage, setActivePage }: any) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Data Pipeline", icon: Upload },
    { id: "security", label: "Threat Matrix", icon: ShieldAlert },
    { id: "nexus", label: "Model Nexus", icon: Cpu },
    { id: "agents", label: "Agent Nexus", icon: BrainCircuit },
    { id: "insights", label: "Cognitive Intel", icon: Zap },
    { id: "debug", label: "System Logs", icon: Terminal },
  ];

  return (
    <div className="w-60 border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-xl flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-6 space-y-8 flex-1">
        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold px-2">Navigation</p>
            <div className="space-y-1">
                {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                    activePage === item.id 
                        ? "bg-slate-800/50 text-brand-accent border border-slate-700/50 shadow-sm" 
                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                    }`}
                >
                    <item.icon size={16} className={activePage === item.id ? "text-brand-accent" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />
                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                </button>
                ))}
            </div>
        </div>

        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold px-2">Active Agents</p>
            <ul className="space-y-4 px-2">
                <li className="flex items-center justify-between ">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] font-mono text-slate-300">DATA_CLEAN_01</span>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-black tracking-widest">LIVE</span>
                </li>
                <li className="flex items-center justify-between ">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] font-mono text-slate-300">ML_PREDICT_B2</span>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-black tracking-widest">LIVE</span>
                </li>
                <li className="flex items-center justify-between ">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-slate-300">SEC_ANOMALY_X</span>
                    </div>
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black tracking-widest">PROC</span>
                </li>
            </ul>
        </div>
      </div>
      
      <div className="mt-auto border-t border-slate-800/60 p-6 flex flex-col gap-1">
        <div className="text-[10px] font-mono text-slate-500 tracking-wider">SYSTEM STATUS: <span className="text-emerald-500 font-bold">SECURE</span></div>
        <div className="text-[10px] font-mono text-slate-500 tracking-wider">UPTIME: 99.98%</div>
      </div>
    </div>
  );
};

// --- Pages ---

// Components moved to separate files

// Components moved to separate files

// --- Main App ---

import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, where } from "firebase/firestore";
import { db, handleFirestoreError } from "./services/firebase";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [activePage, setActivePage] = useState<PageId>("home");
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isDefenseMode, setIsDefenseMode] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const handleBootComplete = () => {
    setIsBooting(false);
  };
  const socketRef = useRef<Socket | null>(null);
  
  const notifySound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (analysisResult?.riskScore > 10 && !isDefenseMode) {
      // Auto-trigger defense mode if risk too high
      setIsDefenseMode(true);
    }
  }, [analysisResult]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Artificial Heartbeat and Real Telemetry fetching
    const fetchStats = async (retries = 3) => {
      try {
        const data = await getTelemetry();
        setTelemetry(data);
      } catch (err) {
        console.error("Telemetry failed", err);
        if (retries > 0) {
          console.log(`Retrying telemetry fetch... (${retries} attempts left)`);
          setTimeout(() => fetchStats(retries - 1), 2000);
        }
      }
    };

    // Initial delay to allow server to boot in dev mode
    const bootTimer = setTimeout(() => {
      fetchStats();
    }, 3000);

    const interval = setInterval(() => {
      fetchStats(0); // No retries for interval pulses
      
      const heartbeatLog: AgentLog = {
        timestamp: new Date().toISOString(),
        agent: "Kernel Watcher",
        input: "CORE_PULSE_CHECK",
        thought: "Verifying subsystem health and synchronizing distributed cache.",
        output: "STATUS_OK :: HEARTBEAT_TRANSMITTED"
      };
      setLogs(prev => [...prev.slice(-49), heartbeatLog]);
    }, 10000);

    return () => {
      clearTimeout(bootTimer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Socket initialization
    const socket = io();
    socketRef.current = socket;

    socket.on("debug:log", (log: AgentLog) => {
      setLogs(prev => [...prev.slice(-49), log]);
    });

    socket.on("notification", (alert: SecurityAlert) => {
      if (alert.type === "alert") {
          // Play alert sound if possible
          const audio = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audio.createOscillator();
          const gain = audio.createGain();
          osc.connect(gain);
          gain.connect(audio.destination);
          osc.frequency.value = 880;
          gain.gain.value = 0.1;
          osc.start();
          setTimeout(() => osc.stop(), 500);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "security_alerts"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SecurityAlert[];
      setAlerts(newAlerts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "security_alerts");
    });

    return () => unsubscribe();
  }, [user]);

  const handleDataUpload = async (file: File) => {
    setIsProcessing(true);
    setActivePage("debug");
    
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      agent: "Interface",
      input: `FILE_UPLOAD::${file.name}`,
      thought: "Initiating multi-vector analysis protocol on raw telemetry unit.",
      output: "UPLOAD_SUCCESS :: HANDING_OFF_TO_BACKEND"
    }]);

    try {
      const result = await analyzeCSV(file);
      const analysisLogs: AgentLog[] = Object.entries(result.agents).map(([name, thought]: any) => ({
        timestamp: new Date().toISOString(),
        agent: name.toUpperCase(),
        input: "SYSTEM_SIGNAL",
        thought: thought as string,
        output: "TASK_COMPLETE"
      }));

      setAnalysisResult({
        data: result.data,
        anomalies: result.anomalies,
        riskScore: result.summary.risk_score,
        integrity: result.summary.integrity,
        health: result.summary.health,
        summary: result.insight,
        cognitivePath: analysisLogs
      });

      // Update global logs as well for the debug view
      setLogs(prev => [...prev, ...analysisLogs]);
      
      if (result.summary.risk_score > 10) {
        // Save to Firestore for persistence
        const alertPath = 'security_alerts';
        try {
          await addDoc(collection(db, alertPath), {
            type: "alert",
            message: `CRITICAL DETECTED: Risk Score ${result.summary.risk_score.toFixed(2)}%. Isolation required.`,
            riskScore: Math.round(result.summary.risk_score * 10) / 10,
            timestamp: serverTimestamp(),
            userId: auth.currentUser?.uid,
            logs: analysisLogs
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, alertPath);
        }
      }
      
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        agent: "System",
        input: "ANALYSIS_FAILED",
        thought: "Critical failure in neural pipeline.",
        output: `ERROR::${error instanceof Error ? error.message : 'UNKNOWN'}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return (
        <DashboardPage 
          data={analysisResult?.data} 
          alerts={alerts} 
          anomalies={analysisResult?.anomalies} 
          riskScore={analysisResult?.riskScore} 
          telemetry={telemetry}
        />
      );
      case "upload": return <UploadPage onDataUpload={handleDataUpload} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />;
      case "security": return <SecurityPage alerts={alerts} isDefenseMode={isDefenseMode} />;
      case "insights": return <InsightsPage analysisResult={analysisResult} />;
      case "agents": return <AgentsPage isProcessing={isProcessing} logs={logs} />;
      case "debug": return <DebugPage logs={logs} />;
      case "nexus": return <NexusPage />;
      case "home":
      default: return <HomePage setActivePage={setActivePage} />;
    }
  };

  if (loading || isBooting) {
    return <NeuralBootSequence onComplete={handleBootComplete} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-8 cyber-grid">
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card p-12 text-center space-y-8 relative z-10"
          >
             <div className="relative inline-block">
                <div className="absolute -inset-10 bg-brand-accent/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="bg-slate-900 border border-brand-accent/30 p-6 rounded-3xl relative z-10 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
                  <BrainCircuit size={48} className="text-brand-accent" />
                </div>
             </div>
             
             <div className="space-y-2">
               <h1 className="text-5xl font-black tracking-tighter uppercase italic">NEURAL<span className="text-brand-accent">X</span></h1>
               <p className="text-slate-500 text-[10px] tracking-[0.3em] font-black uppercase">Kernel Access Required</p>
             </div>

             <div className="space-y-4">
                <button 
                  onClick={() => signIn()}
                  className="w-full py-4 bg-brand-accent text-brand-bg font-black rounded-xl hover:bg-cyan-400 transition-all shadow-xl shadow-brand-accent/20 uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
                >
                  <User size={18} className="group-hover:scale-110 transition-transform" />
                  De-Encrypt with Google
                </button>
                <div className="text-[9px] text-slate-600 font-mono flex items-center justify-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-brand-accent"></div> 
                   BIOMETRIC_HANDSHAKE_READY
                </div>
             </div>
             
             <div className="pt-8 border-t border-white/5 text-[10px] text-slate-600 font-mono grid grid-cols-1 gap-1">
                <span>SYSTEM_AUTH_V4.2 // SECURITY_ENFORCED</span>
                <span className="opacity-40 tracking-tighter">ESTABLISHED_CONNECTION_ENCRYPTED</span>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Show skeleton if major telemetry hasn't arrived yet
  if (!telemetry && activePage === "dashboard") {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-200 selection:bg-brand-accent selection:text-brand-bg transition-colors">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        alerts={alerts} 
        user={user} 
        isDefenseMode={isDefenseMode}
        setIsDefenseMode={setIsDefenseMode}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto p-8 cyber-grid relative">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Real-time Ticker */}
      <div className="h-6 glass border-t border-white/5 flex items-center px-4 overflow-hidden text-[10px] uppercase font-bold tracking-widest text-slate-500 whitespace-nowrap">
        <div className="flex items-center gap-2 mr-8">
            <span className="text-brand-accent">CORE:</span> {telemetry?.metrics.cpu || "---"}
        </div>
        <div className="flex items-center gap-2 mr-8">
            <span className="text-brand-accent">MEM:</span> {telemetry?.metrics.memory || "---"}
        </div>
        <div className="flex items-center gap-2 mr-8">
            <span className="text-emerald-400">NET:</span> {telemetry?.metrics.latency || "---"} LATENCY
        </div>
        <div className="animate-marquee inline-block">
            NEURALX_SURVEILLANCE_SYSTEM_STABLE // PROBABILITY_OF_INTRUSION: {(100 - (analysisResult?.integrity || 99.9)).toFixed(3)}% // ALL_SYSTEMS_OPERATIONAL // SECURE_HANDSHAKE_ESTABLISHED //
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
