import { app } from "./app";

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// TODO: Implement graceful shutdown logic
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  // TODO: Close database connections
  // TODO: Wait for ongoing requests to complete
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  // TODO: Close database connections
  // TODO: Wait for ongoing requests to complete
  process.exit(0);
});
