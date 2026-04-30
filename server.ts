import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { parse } from "csv-parse/sync";
import cors from "cors";
import { std, mean } from "mathjs";
import { createServer } from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  const PORT = 3000;
  const upload = multer({ storage: multer.memoryStorage() });

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Socket events
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.emit("debug:log", {
      timestamp: new Date().toISOString(),
      agent: "Socket_Kernel",
      input: "CONNECTION_ESTABLISHED",
      thought: "Handshaking with remote neural interface.",
      output: "READY"
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Simulation State
  let systemRisk = 6.2;

  // API Routes
  app.post("/api/analyze", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString();
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true
      });

      if (records.length === 0) {
        return res.status(400).json({ error: "Empty CSV file" });
      }

      const columns = Object.keys(records[0]);
      const numericCols = columns.filter(col => typeof records[0][col] === 'number');

      if (numericCols.length === 0) {
        return res.status(400).json({ error: "No numeric columns for analysis" });
      }

      const anomalies: any[] = [];
      const stats: any = {};

      numericCols.forEach(col => {
        const values = records.map((r: any) => r[col]);
        stats[col] = {
          mean: mean(values),
          std: std(values)
        };
      });

      records.forEach((record: any, index: number) => {
        let isAnomaly = false;
        numericCols.forEach(col => {
          const zScore = Math.abs((record[col] - stats[col].mean) / stats[col].std);
          if (zScore > 2.5) isAnomaly = true;
        });

        if (isAnomaly) {
          anomalies.push({ ...record, id: `anomaly-${index}`, riskScore: 7.5 + Math.random() * 2.5 });
        }
      });

      const risk = (anomalies.length / records.length) * 100 + (Math.random() * 4);
      systemRisk = risk;

      const agents = {
        data_agent: `Normalized ${records.length} records across ${numericCols.length} vectors.`,
        ml_agent: `Neural handshake complete. Detected ${anomalies.length} structural drifts.`,
        security_agent: `Isolation Forest sequence finalized. Risk coefficient: ${risk.toFixed(2)}%`,
        decision_agent: risk > 15 ? "AGGRESSIVE_DEFENSE_REQUIRED" : "MONITOR_ONLY"
      };

      const report = `EXECUTIVE SUMMARY: Analysis of ${records.length} data points completed. 
Total Anomalies Detected: ${anomalies.length}.
Calculated Risk Index: ${risk.toFixed(2)}%.
Assessment: ${risk < 10 ? 
"System integrity remains within high-fidelity bounds. No immediate intervention required." : 
risk < 20 ? 
"Detected structural drifts in secondary vectors. Recommend heightened monitoring of core subsystems." : 
"CRITICAL: High-magnitude anomalies localized in core processing nodes. Immediate isolation and manual audit required."}
`;

      res.json({
        success: true,
        summary: {
          total_rows: records.length,
          anomalies: anomalies.length,
          risk_score: Number(risk.toFixed(2)),
          integrity: Number((100 - risk).toFixed(2)),
          health: risk < 10 ? "OPTIMAL" : risk < 20 ? "WARNING" : "CRITICAL"
        },
        data: records.slice(0, 500), 
        anomalies: anomalies.slice(0, 100),
        agents,
        insight: report
      });
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/compliance/status", (req, res) => {
    res.json({
      SOX: { status: "COMPLIANT", lastAudit: "2024-04-15", completion: 100 },
      GDPR: { status: "ACTIVE", nextAudit: "2025-01-20", completion: 92 },
      HIPAA: { status: "WARNING", lastAudit: "2024-03-01", completion: 88 },
      PCI_DSS: { status: "COMPLIANT", completion: 100 }
    });
  });

  app.post("/api/retrain", (req, res) => {
    const { modelType, parameters } = req.body;
    console.log(`[RETRAIN] Initiating for ${modelType} with params:`, parameters);
    res.json({
      success: true,
      sessionId: `retrain-${Math.random().toString(36).substr(2, 9)}`,
      estimatedTime: "1.2s"
    });
  });

  app.get("/api/security/scan", (req, res) => {
    const vulnerabilities = [
      { id: "VULN-001", name: "Outdated Cryptographic Library", risk: 8.5, description: "System using OpenSSL 1.1.1 which has reached EOL." },
      { id: "VULN-002", name: "Insecure API Exposure", risk: 6.2, description: "Endpoint /api/debug is accessible without proper authentication tokens." },
      { id: "VULN-003", name: "Weak SSH Cipher Suite", risk: 4.1, description: "SSH server allows CBC mode ciphers which are vulnerable to plaintext recovery attacks." },
      { id: "VULN-004", name: "Missing Security Headers", risk: 2.8, description: "X-Frame-Options or Content-Security-Policy headers missing in web responses." }
    ];

    // Simulate some randomness
    const results = vulnerabilities.filter(() => Math.random() > 0.3);

    res.json({
      timestamp: new Date().toISOString(),
      findings: results,
      totalFindings: results.length,
      criticalCount: results.filter(v => v.risk > 8).length
    });
  });

  app.get("/api/telemetry", (req, res) => {
    const benchmarks = {
      finance: 12.5 + (Math.random() * 2 - 1),
      healthcare: 18.2 + (Math.random() * 2 - 1),
      manufacturing: 24.5 + (Math.random() * 2 - 1),
      retail: 15.8 + (Math.random() * 2 - 1),
    };

    res.json({
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: `${(2.1 + Math.random() * 1.5).toFixed(2)}GHz`,
        memory: `${(12.4 + Math.random() * 2).toFixed(1)}GB_FREE`,
        latency: `${(15 + Math.random() * 20).toFixed(0)}ms`,
        uptime: "99.9997%"
      },
      risk: systemRisk + (Math.random() * 0.2 - 0.1),
      benchmarks,
      activeNodes: ["US-EAST-1", "EU-CENTRAL-1", "ASIA-SOUTH-2"],
      threats: [
        { type: "DDoS Vector", severity: "LOW", origin: "CN-SHANGHAI" },
        { type: "API Scraping", severity: "MEDIUM", origin: "RU-MOSCOW" }
      ]
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // Start listening BEFORE Vite starts so API routes are responsive immediately
  const server = httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[BOOT] NeuralX Server successfully bound to 0.0.0.0:${PORT}`);
    console.log(`[BOOT] API routes active. Initializing Vite middleware...`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log(`[BOOT] Vite middleware attached.`);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Server startup failed:", err);
  process.exit(1);
});
