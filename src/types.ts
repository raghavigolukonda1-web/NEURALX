export interface AgentLog {
  timestamp: string;
  agent: string;
  input: string;
  thought: string;
  output: string;
}

export interface SecurityAlert {
  id: string;
  type: "info" | "warning" | "alert";
  message: string;
  riskScore: number;
  timestamp: string;
  userId?: string;
  logs?: AgentLog[];
  findings?: any[];
}

export interface AnalysisResult {
  data: any[];
  predictions: any[];
  anomalies: any[];
  summary: string;
  riskScore: number;
  cognitivePath?: AgentLog[];
}

export type PageId = "home" | "dashboard" | "upload" | "agents" | "security" | "insights" | "debug" | "nexus";

export interface TelemetryData {
  timestamp: string;
  metrics: {
    cpu: string;
    memory: string;
    latency: string;
    uptime: string;
  };
  risk: number;
  benchmarks: {
    finance: number;
    healthcare: number;
    manufacturing: number;
    retail: number;
  };
  activeNodes: string[];
  threats: { type: string; severity: string; origin: string; }[];
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
