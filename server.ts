import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { TOTP } from "totp-generator";

// In CJS bundle (production), __dirname and require are already defined.
// In tsx (dev), we handle ESM/CJS compatibility carefully.
let SmartAPI: any;

// Helper to get __dirname in both ESM and CJS
const getDirname = () => {
  try {
    // @ts-ignore
    return __dirname;
  } catch (e) {
    // Fallback for ESM
    try {
      return path.dirname(fileURLToPath(import.meta.url));
    } catch (e2) {
      return process.cwd();
    }
  }
};

const __dirname_safe = getDirname();

// Load environment variables
dotenv.config();

// Unified paths
const distPath = path.join(process.cwd(), "dist");

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

  console.log("Initializing SmartAPI loading...");
  try {
    // Use dynamic require for CJS or dynamic import for ESM
    const smartapi_pkg = typeof require !== "undefined" 
      ? require("smartapi-javascript")
      : (await import("smartapi-javascript")).default || (await import("smartapi-javascript"));

    if (smartapi_pkg) {
      console.log("Loading smartapi-javascript. Package exports found.");
      const SmartAPI_Class = smartapi_pkg.SmartAPI || (smartapi_pkg.default && smartapi_pkg.default.SmartAPI) || smartapi_pkg;
      SmartAPI = SmartAPI_Class;
      console.log("SmartAPI Class extracted:", !!SmartAPI);
    }
  } catch (e) {
    console.error("Failed to load smartapi-javascript library:", e);
  }

  console.log("Final library status:", { 
    hasSmartAPI: !!SmartAPI
  });


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
      
      const { credentials } = req.body;
      
      const clientId = credentials?.clientId || process.env.ANGEL_ONE_CLIENT_ID;
      const apiKey = credentials?.apiKey || process.env.ANGEL_ONE_API_KEY;
      const password = credentials?.password || process.env.ANGEL_ONE_PASSWORD;
      const totpSecret = credentials?.totpSecret || process.env.ANGEL_ONE_TOTP_SECRET;

      console.log("Credential source:", credentials ? "User-provided" : "Environment-provided");
      console.log("Environment check:", {
        clientId: !!clientId,
        apiKey: !!apiKey,
        password: !!password,
        totpSecret: !!totpSecret
      });

      // ... existing validation and TOTP logic ...

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
        
        const totpResult = await TOTP.generate(rawSecret);
        totpToken = totpResult.otp;
        
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

      // Helper to find similar method names
      const findInstanceMethod = (obj: any, names: string[]) => {
        for (const name of names) {
          if (typeof obj[name] === 'function') return obj[name];
        }
        return null;
      };

      // Check for holdings method
      const getHoldingsFn = findInstanceMethod(instance, ['getAllHolding', 'getHolding', 'getHoldings', 'get_holdings']);
      const getMFHoldingsFn = findInstanceMethod(instance, ['getAllMutualFundHoldings', 'getGMFHoldings', 'getMFHoldings', 'get_all_mutual_funds_holdings']);
      
      if (!getHoldingsFn) {
        console.error("Critical: No holdings method found on smart_api instance. Available methods:", allMethods);
        throw new Error(`API SDK mismatch: No holdings method found. Available: ${allMethods.slice(0, 15).join(", ")}`);
      }

      console.log("Fetching Equity holdings using method:", getHoldingsFn.name || "anonymous");
      // Note: In some versions, it might require params, but usually not for holdings
      const holdingsResult = await getHoldingsFn.call(smart_api);
      
      let holdingsData = [];
      let summaryData: any = null;

      if (holdingsResult && holdingsResult.status) {
          if (Array.isArray(holdingsResult.data)) {
              holdingsData = holdingsResult.data.map((h: any) => ({ ...h, _source_type: 'EQUITY' }));
              if (holdingsResult.totalholdingvalue || holdingsResult.totalvalue) {
                  summaryData = { totalholdingvalue: Number(holdingsResult.totalholdingvalue || holdingsResult.totalvalue || 0) };
              }
          } else if (holdingsResult.data && holdingsResult.data.holdings) {
              holdingsData = holdingsResult.data.holdings.map((h: any) => ({ ...h, _source_type: 'EQUITY' }));
              summaryData = { 
                  totalholdingvalue: Number(holdingsResult.data.totalholdingvalue || holdingsResult.data.totalvalue || 0),
                  totalinvvalue: Number(holdingsResult.data.totalinvvalue || 0)
              };
          }
      }

      // Fetch Mutual Fund holdings if method exists
      if (getMFHoldingsFn) {
          try {
              console.log("Fetching Mutual Fund holdings...");
              const mfResult = await getMFHoldingsFn.call(smart_api);
              if (mfResult && mfResult.status && mfResult.data) {
                  const mfData = Array.isArray(mfResult.data) ? mfResult.data : (mfResult.data.holdings || [mfResult.data]);
                  console.log(`Fetched ${mfData.length} Mutual Fund holdings.`);
                  
                  // Map MF data to a similar structure if needed, or just append
                  const normalizedMF = mfData.map((m: any) => ({
                      ...m,
                      _source_type: 'MUTUAL_FUND',
                      // Normalize common fields if they differ
                      tradingsymbol: m.tradingsymbol || m.symbol || m.mfname,
                      ltp: m.ltp || m.nav || m.currentvalue / m.quantity || 0,
                      quantity: m.quantity || m.units || 0,
                      isin: m.isin || m.mfsymbol
                  }));
                  
                  holdingsData = [...holdingsData, ...normalizedMF];
                  
                  // Update summary data to include MF value
                  const mfTotal = Number(mfResult.totalholdingvalue || mfResult.totalvalue || mfResult.data.totalholdingvalue || 
                                       mfData.reduce((acc: number, cur: any) => acc + (Number(cur.currentvalue || (cur.ltp * cur.quantity) || 0)), 0));
                  
                  if (summaryData) {
                      summaryData.totalholdingvalue += mfTotal;
                  } else {
                      summaryData = { totalholdingvalue: mfTotal };
                  }
              }
          } catch (mfErr) {
              console.error("Non-critical error fetching MF holdings:", mfErr);
          }
      }
      
      // Also fetch Trade Book and Order Book for Transactions Dashboard
      const getTradeBookFn = findInstanceMethod(instance, ['getTradeBook', 'get_tradebook', 'get_trade_book', 'getTrades']);
      const getOrderBookFn = findInstanceMethod(instance, ['getOrderBook', 'get_orderbook', 'get_order_book', 'getOrders']);

      let tradeBook = [];
      let orderBook = [];

      try {
        if (getTradeBookFn) {
           console.log("Fetching trade book...");
           const trades = await getTradeBookFn.call(smart_api);
           if (trades && trades.status && trades.data) {
             tradeBook = trades.data;
           }
        }
        if (getOrderBookFn) {
           console.log("Fetching order book...");
           const orders = await getOrderBookFn.call(smart_api);
           if (orders && orders.status && orders.data) {
             orderBook = orders.data;
           }
        }
      } catch (bookErr) {
        console.error("Non-critical error fetching books:", bookErr);
      }

      // Fetch RMS (Funds) details
      const getRMSFn = findInstanceMethod(instance, ['getRMS', 'getRMSLimit', 'get_rms', 'get_rms_limit']);
      const getLedgerFn = findInstanceMethod(instance, ['getLedger', 'get_ledger', 'getStatement', 'get_statement', 'getAccountStatement']);
      
      let rmsData = null;
      let ledgerData = null;

      try {
        if (getRMSFn) {
          console.log("Fetching RMS/Funds data...");
          const rms = await getRMSFn.call(smart_api);
          if (rms && rms.status && rms.data) {
            rmsData = rms.data;
          }
        }
        
        if (getLedgerFn) {
           console.log("Found a potential Ledger/Statement method! Fetching since Jan 2025...");
           // Format dates as DD-MM-YYYY which is common for Angel One
           const today = new Date();
           const toDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
           const fromDate = "01-01-2025";
           
           try {
             const ledger = await getLedgerFn.call(smart_api, {
               fromdate: fromDate,
               todate: toDate
             });
             if (ledger && ledger.status && ledger.data) {
               ledgerData = ledger.data;
               console.log(`Successfully fetched ${ledgerData.length} ledger entries.`);
             }
           } catch (e) {
             console.log("Ledger fetch failed with params, trying without:", e);
             try {
                const ledger = await getLedgerFn.call(smart_api);
                if (ledger && ledger.status && ledger.data) {
                  ledgerData = ledger.data;
                }
             } catch (e2) {
                console.log("Ledger fetch failed completely:", e2);
             }
           }
        }
      } catch (rmsErr) {
        console.error("Non-critical error fetching RMS/Ledger:", rmsErr);
      }

      if (!holdingsResult || !holdingsResult.status) {
          console.error("Holdings API returned failure:", holdingsResult);
          throw new Error(holdingsResult?.message || "Failed to fetch holdings from Angel One.");
      }
      
      console.log("--- Angel One Sync Completed Successfully ---");
      res.json({
        status: "success",
        holdings: holdingsData,
        holdings_summary: summaryData,
        trades: tradeBook || [],
        orders: orderBook || [],
        funds: rmsData,
        ledger: ledgerData
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
        const totpResult = await TOTP.generate(rawSecret);
        totpToken = totpResult.otp;
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

      const getMarketDataFn = (names: string[]) => {
        for (const name of names) {
          if (typeof (smart_api as any)[name] === 'function') return (smart_api as any)[name];
        }
        return null;
      };
      
      const marketDataMethod = getMarketDataFn(['getMarketData', 'marketData', 'get_market_data']);
      if (!marketDataMethod) {
        throw new Error("getMarketData method not found on SDK instance.");
      }
      
      const exchangeTokens: any = {};
      tokens.forEach((t: any) => {
        if (!exchangeTokens[t.exchange]) exchangeTokens[t.exchange] = [];
        exchangeTokens[t.exchange].push(t.symboltoken);
      });

      const marketData = await marketDataMethod.call(smart_api, {
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

  // API Route for Symbol Search (Heuristic for SGBs)
  app.get("/api/market/search", async (req, res) => {
    try {
      const { query: searchQuery } = req.query;
      if (!searchQuery) return res.status(400).json({ error: "Query is required" });

      const clientId = process.env.ANGEL_ONE_CLIENT_ID;
      const apiKey = process.env.ANGEL_ONE_API_KEY;
      const password = process.env.ANGEL_ONE_PASSWORD;
      const totpSecret = process.env.ANGEL_ONE_TOTP_SECRET;

      if (!clientId || !apiKey || !password || !totpSecret) {
        return res.status(401).json({ error: "Not configured" });
      }

      const rawSecret = String(totpSecret || "").replace(/['"\s]/g, '').toUpperCase().trim();
      const totpResult = await TOTP.generate(rawSecret);
      const totpToken = totpResult.otp;

      const smart_api = new SmartAPI({ api_key: apiKey });
      await smart_api.generateSession(clientId, password, totpToken);

      const searchScripFn = (smart_api as any).searchScrip || (smart_api as any).search_scrip;
      if (!searchScripFn) throw new Error("searchScrip not found");

      // Search in NSE
      const nseRes = await searchScripFn.call(smart_api, {
        exchange: "NSE",
        searchQuery: searchQuery
      });

      // Search in BSE
      const bseRes = await searchScripFn.call(smart_api, {
        exchange: "BSE",
        searchQuery: searchQuery
      });

      const results = [
        ...(nseRes.status && nseRes.data ? nseRes.data : []),
        ...(bseRes.status && bseRes.data ? bseRes.data : [])
      ];

      res.json({ status: "success", data: results });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route to fetch ALL active SGB market data
  app.get("/api/market/sgb-explorer", async (req, res) => {
    try {
      const { query: customTerm } = req.query;
      // ... same auth as before
      const clientId = process.env.ANGEL_ONE_CLIENT_ID;
      const apiKey = process.env.ANGEL_ONE_API_KEY;
      const password = process.env.ANGEL_ONE_PASSWORD;
      const totpSecret = process.env.ANGEL_ONE_TOTP_SECRET;

      if (!clientId || !apiKey || !password || !totpSecret) {
        return res.status(401).json({ error: "Not configured" });
      }

      const rawSecret = String(totpSecret || "").replace(/['"\s]/g, '').toUpperCase().trim();
      const totpResult = await TOTP.generate(rawSecret);
      const totpToken = totpResult.otp;

      const smart_api = new SmartAPI({ api_key: apiKey });
      await smart_api.generateSession(clientId, password, totpToken);

      const searchScripFn = (smart_api as any).searchScrip || (smart_api as any).search_scrip;
      
      // Broader search for SGBs - including specific series requested
      const baseTerms = ["SGB", "SOVEREIGN", "SGBAUG28", "SGBN28", "SGBDE30", "SGBAUG28V", "SGBN28VIII", "SGBDE30III", "SGBNOV28", "SGBDEC30", "SGBN28V", "SGBDE30V"];
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const years = ["24", "25", "26", "27", "28", "29", "30", "31", "32"];
      
      const chronologicalTerms = years.map(y => `SGB${y}`);
      const monthlyTerms = months.map(m => `SGB${m}`);
      
      let searchTerms = [...new Set([...baseTerms, ...chronologicalTerms, ...monthlyTerms])];
      
      if (customTerm && typeof customTerm === 'string' && customTerm.length > 1) {
        const ct = customTerm.toUpperCase();
        searchTerms = [ct, `SGB${ct}`, `SGB ${ct}`, ...searchTerms];
      }
      
      const allRawResults: any[] = [];
      
      // Execute searches in batches
      const BATCH_SIZE = 5;
      for (let i = 0; i < searchTerms.length; i += BATCH_SIZE) {
        const batch = searchTerms.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (term) => {
          try {
            const nseRes = await searchScripFn.call(smart_api, { exchange: "NSE", searchQuery: term });
            if (nseRes.status && nseRes.data) allRawResults.push(...nseRes.data);
            
            const bseRes = await searchScripFn.call(smart_api, { exchange: "BSE", searchQuery: term });
            if (bseRes.status && bseRes.data) allRawResults.push(...bseRes.data);
          } catch (e) {
            console.error(`Search failed for term ${term}:`, e);
          }
        }));
      }

      // Filter for actual SGB symbols
      const sgbList = allRawResults.filter((d: any) => {
        const symbol = d.tradingsymbol.toUpperCase();
        const name = (d.symbolname || "").toUpperCase();
        
        return (
          (symbol.includes("SGB") || symbol.startsWith("SOV") || name.includes("SOVEREIGN GOLD")) &&
          !symbol.includes("GOLDBEES") &&
          !symbol.includes("GOLD1")
        );
      });

      // Deduplicate by normalized trading symbol and exchange
      const uniqueSgbs: any[] = [];
      const seenSymbolExchange = new Set();

      for (const s of sgbList) {
        const key = `${s.tradingsymbol}_${s.exchange}`;
        if (!seenSymbolExchange.has(key)) {
          seenSymbolExchange.add(key);
          uniqueSgbs.push(s);
        }
      }

      // Prioritize custom term matches in the list
      if (customTerm && typeof customTerm === 'string') {
        const query = customTerm.toUpperCase();
        uniqueSgbs.sort((a, b) => {
          const aMatch = a.tradingsymbol.toUpperCase().includes(query);
          const bMatch = b.tradingsymbol.toUpperCase().includes(query);
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }

      // Take a decent number to explore
      const listToFetch = uniqueSgbs.slice(0, 250);

      // Group market data requests by exchange
      const nseTokens = listToFetch.filter(s => s.exchange === "NSE").map(s => s.symboltoken);
      const bseTokens = listToFetch.filter(s => s.exchange === "BSE").map(s => s.symboltoken);

      const marketData: any = { data: { fetched: [] } };
      
      // Split into smaller batches if needed, but 50-100 is usually okay for one FULL request
      try {
        const fetchObj: any = {};
        if (nseTokens.length > 0) fetchObj["NSE"] = nseTokens;
        if (bseTokens.length > 0) fetchObj["BSE"] = bseTokens;
        
        if (Object.keys(fetchObj).length > 0) {
          const resFull = await smart_api.getMarketData("FULL", fetchObj);
          if (resFull.status && resFull.data) marketData.data = resFull.data;
        }
      } catch (e) {
        console.error("Market data fetch failed:", e);
      }

      const processed = listToFetch.map((s: any) => {
        const live = (marketData.data?.fetched || []).find((f: any) => f.symboltoken === s.symboltoken);
        return {
          symbol: s.tradingsymbol,
          token: s.symboltoken,
          exchange: s.exchange || "NSE",
          ltp: live?.ltp || 0,
          pClose: live?.close || 0,
          percentChange: live?.percentChange || 0,
          high: live?.high || 0,
          low: live?.low || 0,
          volume: live?.volume || 0,
          name: s.symbolname || s.tradingsymbol
        };
      }).filter(p => p.ltp > 0 || p.volume > 0); // Only keep ones that have some activity

      res.json({ status: "success", data: processed });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
    console.log(`Server listening on port ${PORT} - READY FOR REQUESTS`);
  });
}

console.log("Starting server process...");
startServer().then(() => {
  console.log("startServer() promise resolved");
}).catch(err => {
  console.error("Failed to start server ERROR:", err);
});

