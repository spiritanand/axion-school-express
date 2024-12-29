const app = require("./app");
const config = require("./config/index.config.js");

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Rate limiting: ${config.dotEnv.RATE_LIMIT_MAX_REQUESTS} requests per ${config.dotEnv.RATE_LIMIT_WINDOW_MS}ms`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
