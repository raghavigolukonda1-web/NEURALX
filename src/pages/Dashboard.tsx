import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  BarChart,
  Bar,
  Brush
} from "recharts";
import { ShieldAlert, Cpu, Activity, AlertTriangle, TrendingUp, DollarSign, Globe, Clock, Zap, Brain } from "lucide-react";
import { GlassCard, StatCard } from "../components/UI";
import { auth } from "../services/firebase";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

export const DashboardPage = ({ data = [], alerts = [], anomalies = [], riskScore = 0, telemetry }: any) => {
  const [securityMode, setSecurityMode] = useState<"STANDARD" | "AGGRESSIVE">("STANDARD");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const generateCognitiveSummary = async () => {
    setIsSynthesizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const stats = {
        threats: (alerts || []).length,
        anomalies: (anomalies || []).length,
        risk: riskScore,
        mode: securityMode,
        integrity: (100 - riskScore).toFixed(1)
      };

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are the NeuralX Core Intelligence. Provide a high-level technical summary of the system state. Use futuristic, cyberpunk, and precise terminology. Max 2 short paragraphs."
        },
        contents: `Current System Metrics: ${JSON.stringify(stats)}`
      });
      setAiSummary(result.text || "Cognitive synchronization returned null subspace data.");
    } catch (error) {
      console.error("AI Summary generation failed", error);
      setAiSummary("SYSTEM_ERROR: Neural bridge compromised. Unable to synchronize cognitive cores.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (!aiSummary && (alerts || []).length > 0) {
      generateCognitiveSummary();
    }
  }, [(alerts || []).length]);
  
  const benchmarks = telemetry?.benchmarks || {
    finance: 12.5,
    healthcare: 18.2,
    manufacturing: 24.5,
    retail: 15.8,
  };

  const anomalySet = new Set(anomalies || []);
  const normalData = (data || []).filter((d: any) => !anomalySet.has(d)).slice(0, 200);
  const anomalyData = (anomalies || []).slice(0, 80);

  // Generate Risk Trend Data
  const trendData = useMemo(() => {
    if (data.length === 0) return [];
    
    // We'll take a subset of data to represent a timeline
    // If data has no timestamp, we simulate a sequence
    return data.slice(0, 200).map((d: any, i: number) => {
      const ts = d.timestamp || d.Date || d.time;
      const date = ts ? new Date(ts) : new Date(Date.now() - (200 - i) * 60000);
      
      // Calculate a local risk point based on anomaly presence and overall risk
      const isAnomaly = anomalySet.has(d);
      const localRisk = (isAnomaly ? 25 : 5) + (Math.random() * 10) + (riskScore * 0.3);
      
      return {
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fullTime: date.toLocaleString(),
        risk: Number(localRisk.toFixed(2)),
        id: i
      };
    });
  }, [data, anomalySet, riskScore]);

  // Enterprise Financial Impact (Simulated Industry Standard)
  const estimatedValueAtRisk = (riskScore * 12500).toLocaleString(); 
  const mitigationSavings = (((anomalies || []).length * 450) + ((data || []).length * 0.1)).toLocaleString();

  const pieData = [
    { name: 'Operational Stability', value: (data || []).length > 0 ? (data.length - (anomalies || []).length) : 100, color: '#10b981' },
    { name: 'Threat Surface', value: (anomalies || []).length > 0 ? anomalies.length : 0, color: '#f43f5e' },
  ];

  // Robust key selection for PCA-like visualization
  const numericalKeys = (data || []).length > 0 ? Object.keys(data[0]).filter(k => typeof data[0][k] === 'number') : [];
  const xKey = numericalKeys[0] || 'index';
  const yKey = numericalKeys[1] || numericalKeys[0] || 'value';

  // If we only have one column, generate an index for x
  const processedNormal = normalData.map((d, i) => ({
    ...d,
    index: i,
    value: d[xKey] || 0
  }));

  const processedAnomaly = anomalyData.map((d, i) => ({
    ...d,
    index: i + processedNormal.length,
    value: d[xKey] || 0
  }));

  const finalXKey = numericalKeys.length >= 2 ? xKey : 'index';
  const finalYKey = numericalKeys.length >= 2 ? yKey : 'value';

  // Benchmark chart data
  const sectorData = benchmarks ? Object.entries(benchmarks).map(([key, val]: [string, any]) => ({
    name: key.toUpperCase(),
    risk: val.avgRisk,
    latency: val.avgLatency / 10,
    current: riskScore
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Enterprise <span className="text-brand-accent">Analytics</span></h1>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">Multi-agent vector clustering and financial exposure modelling for mission-critical infrastructures.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <GlassCard className="flex-1 md:flex-none px-4 py-3 flex items-center gap-3 border-brand-accent/20 bg-brand-accent/5">
              <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
                <DollarSign size={16} />
              </div>
              <div className="text-right">
                <p className="text-[8px] text-slate-500 uppercase font-black">Value at Risk</p>
                <p className="text-sm font-mono font-bold text-white">${estimatedValueAtRisk}</p>
              </div>
           </GlassCard>
           <GlassCard className="flex-1 md:flex-none px-4 py-3 flex items-center gap-3 border-emerald-500/20 bg-emerald-500/5">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <TrendingUp size={16} />
              </div>
              <div className="text-right">
                <p className="text-[8px] text-slate-500 uppercase font-black">Loss Avoided</p>
                <p className="text-sm font-mono font-bold text-emerald-400">${mitigationSavings}</p>
              </div>
           </GlassCard>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Threats" value={alerts.length} icon={ShieldAlert} trend={-12} color="rose" />
        <StatCard title="Dataset Integrity" value={`${(100 - riskScore).toFixed(1)}%`} icon={Cpu} trend={0.4} color="accent" />
        <StatCard title="Anomalies" value={anomalies.length} icon={Activity} trend={8.1} color="emerald" />
        <StatCard title="Health Index" value={riskScore > 10 ? "CRITICAL" : "OPTIMAL"} icon={AlertTriangle} trend={0} color={riskScore > 10 ? "rose" : "emerald"} />
      </div>

      <AnimatePresence>
        {(aiSummary || isSynthesizing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-6 border-brand-accent/20 bg-brand-accent/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12">
                  <Brain size={120} />
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-brand-accent/10 text-brand-accent ${isSynthesizing ? 'animate-pulse' : ''}`}>
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Neural Cognitive Summary</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping"></span>
                       <span className="text-[8px] text-brand-accent/60 font-mono uppercase tracking-[0.2em]">Core_Pulse: Active</span>
                    </div>
                  </div>
                  <button 
                    onClick={generateCognitiveSummary}
                    disabled={isSynthesizing}
                    className="ml-auto p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-brand-accent transition-all"
                  >
                    <Zap size={14} className={isSynthesizing ? 'animate-spin' : ''} />
                  </button>
               </div>
               <div className="text-[11px] text-slate-300 font-mono leading-relaxed max-w-4xl relative z-10">
                  {isSynthesizing ? (
                    <div className="flex flex-col gap-2">
                       <div className="h-2 w-3/4 bg-brand-accent/10 rounded animate-pulse"></div>
                       <div className="h-2 w-1/2 bg-brand-accent/10 rounded animate-pulse"></div>
                    </div>
                  ) : aiSummary}
               </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vector Chart */}
        <GlassCard className="lg:col-span-2 p-8 border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs">Vector Clustering Pattern</h3>
               <p className="text-[10px] text-slate-600 font-mono mt-1">Multi-dimensional entropy mapping</p>
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
               <span className="text-emerald-500 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                 NORMALIZED
               </span>
               <span className="text-rose-500 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 
                 ANOMALOUS
               </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey={finalXKey} 
                  name={finalXKey} 
                  stroke="#475569" 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => typeof val === 'number' && val > 1000 ? `${(val/1000).toFixed(1)}k` : val}
                />
                <YAxis 
                  type="number" 
                  dataKey={finalYKey} 
                  name={finalYKey} 
                  stroke="#475569" 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => typeof val === 'number' && val > 1000 ? `${(val/1000).toFixed(1)}k` : val}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: '#334155' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-950/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-[10px] min-w-[140px]">
                           <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                             <span className="text-slate-500 font-black uppercase tracking-tighter">Vector ID</span>
                             <span className="text-brand-accent font-mono">#{item.index}</span>
                           </div>
                           <div className="space-y-1.5">
                             <p className="text-slate-300 font-mono flex justify-between gap-4">
                               <span className="text-slate-500">X-POS:</span> {Number(item[finalXKey]).toFixed(3)}
                             </p>
                             <p className="text-slate-300 font-mono flex justify-between gap-4">
                               <span className="text-slate-500">Y-POS:</span> {Number(item[finalYKey]).toFixed(3)}
                             </p>
                             {anomalySet.has(item) && (
                               <div className="mt-2 pt-2 border-t border-rose-500/20 text-rose-500 font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                                 <AlertTriangle size={8} /> CRITICAL_DEVIATION
                               </div>
                             )}
                           </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Normal" 
                  data={processedNormal} 
                  fill="#10b981" 
                  fillOpacity={0.12} 
                  stroke="#10b981" 
                  strokeWidth={0.5} 
                  isAnimationActive={true}
                />
                <Scatter 
                  name="Anomalies" 
                  data={processedAnomaly} 
                  fill="#f43f5e" 
                  fillOpacity={0.7} 
                  stroke="#f43f5e"
                  strokeWidth={1}
                  isAnimationActive={true}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/5 flex flex-col items-center">
          <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs mb-8 w-full text-left">Internal Threat Surface</h3>
          <div className="relative w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${riskScore > 15 ? 'bg-rose-500/5 animate-pulse' : ''}`}>
              <span className={`text-3xl font-black font-mono transition-colors duration-1000 ${riskScore > 10 ? 'text-rose-500' : 'text-white'}`}>
                {riskScore.toFixed(1)}<span className="text-xs">%</span>
              </span>
              <span className="text-[9px] text-slate-500 tracking-[0.4em] uppercase font-black">Net Risk</span>
            </div>
          </div>
          <div className="space-y-4 w-full mt-8">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-mono font-black text-white">
                    {data.length > 0 ? (item.value / data.length * 100).toFixed(1) : 0}%
                  </span>
                  <span className="text-[8px] text-slate-600 font-mono uppercase">{item.value} Units</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <GlassCard className="lg:col-span-2 p-8 border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                     <Globe size={18} />
                  </div>
                  <div>
                     <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs text-nowrap">Industry Benchmark Analysis</h3>
                     <p className="text-[10px] text-slate-600 font-mono mt-1">Global risk distribution vs. internal metrics</p>
                  </div>
               </div>
               <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> SYSTEM</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> AVERAGE</div>
               </div>
            </div>

            <div className="h-56 w-full mt-4 relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: 'Finance', value: benchmarks.finance },
                      { name: 'Healthcare', value: benchmarks.healthcare },
                      { name: 'Mfg', value: benchmarks.manufacturing },
                      { name: 'Retail', value: benchmarks.retail },
                      { name: 'SYSTEM', value: riskScore, isSystem: true }
                    ]} 
                    margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
                  >
                     <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} stroke="#475569" />
                     <YAxis fontSize={9} axisLine={false} tickLine={false} stroke="#475569" hide />
                     <Tooltip 
                        content={({ active, payload }) => (
                          active && payload ? (
                            <div className="bg-slate-950/90 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-[10px] min-w-[120px]">
                               <p className="text-slate-500 uppercase tracking-tighter mb-1 border-b border-white/5 pb-1">{payload[0].payload.name}</p>
                               <div className="space-y-1 mt-2">
                                  <div className="flex justify-between items-center gap-4">
                                     <span className="text-slate-600 font-bold tracking-tighter">SCORE:</span>
                                     <span className="text-white font-mono">{payload[0].value}%</span>
                                  </div>
                               </div>
                            </div>
                          ) : null
                        )}
                     />
                     <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        { [0,1,2,3,4].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 4 ? '#f43f5e' : '#334155'} 
                            fillOpacity={index === 4 ? 0.8 : 0.4}
                            className="transition-all hover:fill-opacity-100"
                          />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Globe size={240} />
            </div>
         </GlassCard>

         <div className="space-y-6">
         <GlassCard className={`p-8 border-white/5 flex flex-col justify-between transition-all duration-700 relative overflow-hidden ${securityMode === 'AGGRESSIVE' ? 'bg-rose-500/[0.03] border-rose-500/20' : ''}`}>
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className={securityMode === 'AGGRESSIVE' ? 'text-rose-500' : 'text-brand-accent'} />
                    <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs text-nowrap">Security Policy</h3>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${securityMode === 'AGGRESSIVE' ? 'bg-rose-500/20 text-rose-500 animate-pulse ring-1 ring-rose-500/30' : 'bg-brand-accent/20 text-brand-accent ring-1 ring-brand-accent/30'}`}>
                     {securityMode}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="group cursor-default">
                     <p className="text-[10px] font-black text-white uppercase tracking-tighter flex items-center justify-between">
                        NEURAL_SENSITIVITY
                        <span className="text-slate-600 font-mono">0.9{securityMode === 'AGGRESSIVE' ? '8' : '4'}</span>
                     </p>
                     <div className="h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: "70%" }}
                          animate={{ width: securityMode === 'AGGRESSIVE' ? "98%" : "70%" }}
                          className={`h-full ${securityMode === 'AGGRESSIVE' ? 'bg-rose-500' : 'bg-brand-accent'}`}
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl transition-colors ${securityMode === 'AGGRESSIVE' ? 'bg-rose-500/10 text-rose-500' : 'bg-white/5 text-slate-500'}`}>
                           <Cpu size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white uppercase tracking-tighter">Heuristic Engine</p>
                           <p className="text-[9px] text-slate-500 mt-1 leading-tight">{securityMode === 'AGGRESSIVE' ? 'Strict isolation of structural drift enabled. Latency +42ms.' : 'Balanced predictive modeling active. Optimized for throughput.'}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl transition-colors ${securityMode === 'AGGRESSIVE' ? 'bg-rose-500/10 text-rose-500' : 'bg-white/5 text-slate-500'}`}>
                           <Zap size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white uppercase tracking-tighter">Auto-Mitigation</p>
                           <p className="text-[9px] text-slate-500 mt-1 leading-tight">{securityMode === 'AGGRESSIVE' ? 'L4 containment active: Auto-dropping suspect nodes.' : 'Observational mode: Alerting only on validated breaches.'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <button 
               onClick={() => setSecurityMode(prev => prev === "STANDARD" ? "AGGRESSIVE" : "STANDARD")}
               className={`mt-10 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 active:scale-95 ${
                  securityMode === 'AGGRESSIVE' 
                  ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
               }`}
            >
               Toggle {securityMode === 'STANDARD' ? 'Aggressive' : 'Standard'} Protocol
            </button>
         </GlassCard>
         </div>
      </div>

      {/* Interactive Risk Trend Chart */}
      <GlassCard className="p-8 border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <TrendingUp size={18} />
             </div>
             <div>
                <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs">Temporal Risk Trajectory</h3>
                <p className="text-[10px] text-slate-600 font-mono mt-1">Real-time risk scoring & forensic timeline</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Clock size={12} />
                <span>WINDOW: 200_METRIC_POINTS</span>
             </div>
          </div>
        </div>
        
        <div className="h-80 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="time" 
                stroke="#475569" 
                fontSize={9} 
                axisLine={false} 
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={9} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-950/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-[10px] min-w-[160px]">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Event Point</span>
                          <span className="text-rose-500 font-mono font-black italic">! ALERT</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-300 font-mono flex justify-between">
                            <span className="text-slate-500">TIMESTAMP:</span> {item.time}
                          </p>
                          <p className="text-slate-300 font-mono flex justify-between">
                            <span className="text-slate-500">SCORE:</span> 
                            <span className={item.risk > 15 ? "text-rose-500 font-bold" : "text-white"}>
                              {item.risk}%
                            </span>
                          </p>
                          <p className="text-[8px] text-slate-600 mt-2 font-mono leading-tight">
                            {item.fullTime}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRisk)" 
                isAnimationActive={true}
                animationDuration={1500}
                activeDot={{ r: 4, stroke: '#f43f5e', strokeWidth: 2, fill: '#0f172a' }}
              />
              <Brush 
                dataKey="time" 
                height={30} 
                stroke="#334155" 
                fill="#020617"
                travellerWidth={10}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};
