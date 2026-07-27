/**
 * server.js
 * -------------------------------------------------------------------------
 * Entry point aplikasi HSE Dashboard (backend Node.js + Express).
 *
 * API di-mount di /api/*.
 * Frontend React + Vite diserve dari folder frontend/dist setelah build.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const apiRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API
app.use("/api", apiRoutes);

// Upload files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// React build
const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));

  app.get("*", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("HSE Dashboard API Running. Frontend belum di-build.");
  });
}

app.listen(PORT, () => {
  console.log(`HSE Dashboard berjalan di port ${PORT}`);
});
