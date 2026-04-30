import { motion } from "motion/react";
import { BrainCircuit } from "lucide-react";

export const GlassCard = ({ children, className = "", ...props }: any) => (
  <div className={`glass-card p-6 rounded-2xl ${className}`} {...props}>
    {children}
  </div>
);

export const StatCard = ({ title, value, icon: Icon, trend, color = "accent" }: any) => (
  <GlassCard className="relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
      <Icon size={64} className={`text-brand-${color}`} />
    </div>
    <div className="flex flex-col">
      <span className="text-slate-400 text-sm font-medium mb-1">{title}</span>
      <span className="text-3xl font-bold tracking-tight mb-2">{value}</span>
      <div className="flex items-center gap-1 text-xs">
        <span className={trend > 0 ? "text-emerald-400" : "text-rose-400"}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
        <span className="text-slate-500">from last period</span>
      </div>
    </div>
  </GlassCard>
);
