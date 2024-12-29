const express = require("express");
const config = require("./config/index.config.js");
const createRateLimiter = require("./mws/rate-limiter.mw");

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize cache
const cache = require("./cache/cache.dbh")({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS,
});

// Rate limiter middleware
const rateLimiter = createRateLimiter({
  cache,
  windowMs: parseInt(config.dotEnv.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(config.dotEnv.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all routes
app.use(rateLimiter);

// Add rate limit headers to all responses
app.use((req, res, next) => {
  res.setHeader("X-RateLimit-Limit", config.dotEnv.RATE_LIMIT_MAX_REQUESTS);
  next();
});

// Load routes
app.use("/api", require("./routes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
