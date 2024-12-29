const config = require("../config/index.config.js");

function createRateLimiter({ cache, windowMs = 15 * 60 * 1000, max = 100 }) {
  return async function rateLimiterMiddleware(req, res, next) {
    const key = `ratelimit:${req.ip}`;

    try {
      const current = await cache.get(key);

      if (!current) {
        await cache.set(key, 1, "PX", windowMs);
        return next();
      }

      const count = parseInt(current);

      if (count >= max) {
        return res.status(429).json({
          error: "Too many requests, please try again later.",
        });
      }

      await cache.incr(key);
      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      // Fail open - allow request in case of Redis error
      next();
    }
  };
}

module.exports = createRateLimiter;
