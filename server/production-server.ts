import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint for Railway
app.get("/health", (_req, res) => {
  res.json({ 
    status: "healthy", 
    message: "Varmepumpetilsynet server is running",
    timestamp: new Date().toISOString() 
  });
});

(async () => {
  // Setup production database on startup
  if (process.env.NODE_ENV === "production") {
    try {
      log("Starting production database setup...");
      const { setupProductionDatabase } = await import("../scripts/production-setup.js");
      await setupProductionDatabase();
      log("✅ Production database setup completed successfully");
    } catch (error) {
      log(`⚠️ Production database setup failed: ${error}`);
      log("Continuing with server startup...");
      // Continue startup even if setup fails - server must stay running
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve static files in production using process.cwd() instead of import.meta.dirname
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    log(`⚠️ Could not find build directory: ${distPath}, make sure to build the client first`);
  } else {
    log(`📁 Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    
    // Fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  const PORT = parseInt(process.env.PORT!) || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();