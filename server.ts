import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createRequire } from "module";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";

const require = createRequire(import.meta.url);

const totpInst = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

// Robustly load dependencies from CJS packages in ESM environment
let SmartAPI: any;

try {
  const smartapi_pkg = require("smartapi-javascript");
  console.log("Loading smartapi-javascript. Package exports:", Object.keys(smartapi_pkg));
  
  // SmartAPI is usually a named export or under default
  const SmartAPI_Class = smartapi_pkg.SmartAPI || (smartapi_pkg.default && smartapi_pkg.default.SmartAPI) || smartapi_pkg;
  SmartAPI = SmartAPI_Class;
  
  console.log("SmartAPI Class found:", !!SmartAPI);
  if (SmartAPI && SmartAPI.prototype) {
    console.log("SmartAPI Prototype methods:", Object.keys(SmartAPI.prototype).filter(m => typeof SmartAPI.prototype[m] === 'function'));
  }
} catch (e) {
  console.error("Failed to load smartapi-javascript library:", e);
}

// Load environment variables as early as possible
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Final library status:", { 
  hasSmartAPI: !!SmartAPI
});

// Process-level error handling to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // app.use(express.json()); // This is already called below
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Health and Config status routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  
  app.get("/api/config/status", (req, res) => {
    const status = {
      ANGEL_ONE_CLIENT_ID: !!process.env.ANGEL_ONE_CLIENT_ID,
      ANGEL_ONE_API_KEY: !!process.env.ANGEL_ONE_API_KEY,
      ANGEL_ONE_PASSWORD: !!process.env.ANGEL_ONE_PASSWORD,
      ANGEL_ONE_TOTP_SECRET: !!process.env.ANGEL_ONE_TOTP_SECRET
    };
    const isConfigured = Object.values(status).every(v => v === true);
    res.json({ configured: isConfigured, status });
  });

  // API Route for Angel One Sync
  app.post("/api/angelone/sync", async (req, res, next) => {
    try {
      console.log("--- Angel One Sync Operation Started ---");
      
      const clientId = process.env.ANGEL_ONE_CLIENT_ID;
      const apiKey = process.env.ANGEL_ONE_API_KEY;
      const password = process.env.ANGEL_ONE_PASSWORD;
      const totpSecret = process.env.ANGEL_ONE_TOTP_SECRET;

      console.log("Environment check:", {
        clientId: !!clientId,
        apiKey: !!apiKey,
        password: !!password,
        totpSecret: !!totpSecret
      });

      // Ensure all required variables are set
      if (!clientId || !apiKey || !password || !totpSecret) {
        console.error("Sync blocked: Missing environment variables.");
        const missing = [];
        if (!clientId) missing.push("ANGEL_ONE_CLIENT_ID");
        if (!apiKey) missing.push("ANGEL_ONE_API_KEY");
        if (!password) missing.push("ANGEL_ONE_PASSWORD");
        if (!totpSecret) missing.push("ANGEL_ONE_TOTP_SECRET");
        
        return res.status(400).json({ 
          error: `Missing required credentials: ${missing.join(", ")}. Please check the Settings menu.`,
          status: "config_error"
        });
      }

      // Sanitize Secret (strip quotes, trim whitespace, remove spaces, force uppercase)
      const rawSecret = String(totpSecret || "").replace(/['"\s]/g, '').toUpperCase().trim();
      
      console.log("TOTP Secret Sanitized Check:", { 
        length: rawSecret.length, 
        isBase32: /^[A-Z2-7=]+$/i.test(rawSecret),
        prefix: rawSecret.length > 3 ? rawSecret.substring(0, 3) + "..." : "short"
      });

      if (!rawSecret || rawSecret.length < 8 || rawSecret === "UNDEFINED" || rawSecret === "NULL") {
        console.error("Invalid Secret Value detected:", rawSecret);
        return res.status(400).json({ 
          error: "TOTP Secret is missing or invalid. Please ensure it is the 16-character 'Enable TOTP' key from Angel One (e.g. ABCD1234EFGH5678).",
          status: "config_error"
        });
      }

      // Generate TOTP
      let totpToken: string = "";
      try {
        console.log("Generating TOTP token...");
        
        totpToken = await totpInst.generate({ secret: rawSecret });
        
        if (!totpToken) {
            throw new Error("Generated TOTP token was null or empty.");
        }
        
        console.log("TOTP generated successfully. Length:", totpToken.length);
      } catch (totpErr: any) {
        console.error("TOTP Generation Error:", totpErr);
        const isBase32 = /^[A-Z2-7=]+$/i.test(rawSecret);
        
        return res.status(400).json({ 
          error: `TOTP Generation Failed: ${totpErr.message}`,
          details: !isBase32 
            ? "The secret is NOT valid Base32. It should only contain A-Z and 2-7." 
            : "The secret is Base32 but the generator failed. Try re-enabling TOTP in Angel One.",
          status: "totp_error"
        });
      }

      if (!SmartAPI) {
        console.error("Critical Failure: SmartAPI library is not loaded.");
        return res.status(500).json({ error: "SmartAPI library failed to initialize on server." });
      }

      // Initialize API and Session
      const smart_api = new SmartAPI({ api_key: apiKey });
      
      console.log("Requesting Angel One session...");
      const session = await smart_api.generateSession(
        clientId,
        password,
        totpToken
      );

      console.log("Session response status:", session.status);
      if (!session.status || !session.data) {
        console.error("Angel One Authentication Failed. Raw response:", JSON.stringify(session));
        return res.status(401).json({ 
          error: session.message || "Authentication with Angel One failed. Check your Client ID, Password, and TOTP Secret.",
          status: "auth_error"
        });
      }

      console.log("Session established successfully.");
      
      // Explicitly inject tokens into the instance state to prevent "Token missing" errors
      // Different versions of the SDK storage these in different places
      const jwtToken = session.data.jwtToken;
      const feedToken = session.data.feedToken;
      const refreshToken = session.data.refreshToken;

      if (!jwtToken) {
        console.error("Critical: jwtToken missing from session data.");
        throw new Error("Authentication succeeded but no JWT token was returned.");
      }

      // Force session state on the instance
      (smart_api as any).jwtToken = jwtToken;
      (smart_api as any).feedToken = feedToken;
      (smart_api as any).refreshToken = refreshToken;
      
      // Some versions use a specific setter or internal property
      if (typeof (smart_api as any).setSession === 'function') {
        (smart_api as any).setSession(jwtToken);
      }
      if (typeof (smart_api as any).setPublicToken === 'function') {
        (smart_api as any).setPublicToken(jwtToken);
      }

      console.log("Session state synchronized. Discovering methods...");
      
      const instance = smart_api as any;
      const prototype = Object.getPrototypeOf(instance);
      const allMethods = [
        ...Object.getOwnPropertyNames(instance),
        ...(prototype ? Object.getOwnPropertyNames(prototype) : [])
      ].filter(k => typeof instance[k] === 'function');
      
      console.log("All discovered methods on smart_api:", allMethods);

      // Check for holdings method using various names found in different SDK versions
      const possibleHoldingsMethods = ['getHoldings', 'getAllHoldings', 'getHolding', 'get_holdings'];
      let getHoldingsFn: Function | null = null;
      
      for (const name of possibleHoldingsMethods) {
        if (typeof instance[name] === 'function') {
          console.log(`Found holdings method: ${name}`);
          getHoldingsFn = instance[name];
          break;
        }
      }
      
      if (!getHoldingsFn) {
        console.error("Critical: No holdings method found on smart_api instance. Available methods:", allMethods);
        throw new Error(`API SDK mismatch: No holdings method found. Available: ${allMethods.slice(0, 10).join(", ")}`);
      }

      console.log("Fetching holdings...");
      const holdingsResult = await getHoldingsFn.call(smart_api);
      
      if (!holdingsResult || !holdingsResult.status) {
          console.error("Holdings API returned failure:", holdingsResult);
          throw new Error(holdingsResult?.message || "Failed to fetch holdings from Angel One.");
      }
      
      console.log("--- Angel One Sync Completed Successfully ---");
      res.json({
        status: "success",
        holdings: holdingsResult.data || []
      });

    } catch (error: any) {
      console.error("Angel One Sync Critical Failure:", error);
      // Ensure we always return JSON
      if (!res.headersSent) {
        res.status(500).json({ 
          error: error.message || "An unexpected error occurred during sync.",
          details: "Please check server logs for more information."
        });
      }
    }
  });

  // API Route for Market Data
  app.post("/api/market/data", async (req, res, next) => {
    try {
      const { tokens } = req.body; // Array of { exchange, tradingsymbol, symboltoken }
      
      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return res.status(400).json({ error: "Invalid or empty tokens list provided." });
      }

      const clientId = process.env.ANGEL_ONE_CLIENT_ID;
      const apiKey = process.env.ANGEL_ONE_API_KEY;
      const password = process.env.ANGEL_ONE_PASSWORD;
      const totpSecret = process.env.ANGEL_ONE_TOTP_SECRET;

      if (!clientId || !apiKey || !password || !totpSecret) {
        return res.status(401).json({ error: "Angel One credentials not configured. Please visit Settings." });
      }

      // Sanitize Secret
      const rawSecret = String(totpSecret || "").replace(/['"\s]/g, '').toUpperCase().trim();
      
      if (!rawSecret || rawSecret.length < 8 || rawSecret === "UNDEFINED" || rawSecret === "NULL") {
        return res.status(400).json({ error: "Invalid TOTP Secret configured. Please check your settings." });
      }

      let totpToken: string;
      try {
        totpToken = await totpInst.generate({ secret: rawSecret });
      } catch (err: any) {
        console.error("TOTP Generation Error in Market Data:", err);
        return res.status(400).json({ error: `TOTP Generation failed: ${err.message}` });
      }

      if (!SmartAPI) {
        return res.status(500).json({ error: "SmartAPI library not initialized." });
      }

      const smart_api = new SmartAPI({ api_key: apiKey });
      const session = await smart_api.generateSession(clientId, password, totpToken);

      if (!session.status || !session.data) {
        return res.status(401).json({ error: session.message || "Authentication failed with Angel One." });
      }

      console.log("Market data session established.");
      
      // Explicitly inject tokens for Market Data session
      const jwtToken = session.data.jwtToken;
      (smart_api as any).jwtToken = jwtToken;
      (smart_api as any).feedToken = session.data.feedToken;
      (smart_api as any).refreshToken = session.data.refreshToken;
      
      if (typeof (smart_api as any).setSession === 'function') {
        (smart_api as any).setSession(jwtToken);
      }
      if (typeof (smart_api as any).setPublicToken === 'function') {
        (smart_api as any).setPublicToken(jwtToken);
      }

      const getMarketDataFn = smart_api.getMarketData;
      if (typeof getMarketDataFn !== 'function') {
        throw new Error("getMarketData method not found on SDK instance.");
      }
      
      const exchangeTokens: any = {};
      tokens.forEach((t: any) => {
        if (!exchangeTokens[t.exchange]) exchangeTokens[t.exchange] = [];
        exchangeTokens[t.exchange].push(t.symboltoken);
      });

      const marketData = await getMarketDataFn.call(smart_api, {
        mode: "LTP",
        exchangeTokens: exchangeTokens
      });
      
      res.json({
        status: "success",
        data: marketData.data || {}
      });

    } catch (error: any) {
      console.error("Market Data fetch error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // Ensure any other /api routes that don't match return a 404 JSON (prevents HTML fallback)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled API Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

