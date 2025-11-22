require('dotenv').config();
const express = require('express');
const cors = require("cors");
const pool = require('./db/pool');

const app = express();

// 1️⃣ CORS FIRST
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"]
}));

// 2️⃣ JSON parser
app.use(express.json());

// 3️⃣ API routes
const linksRouter = require('./routes/links.routes');
app.use('/api/links', linksRouter);

// 4️⃣ HEALTH CHECK (must be before redirect)
app.get("/healthz", async (req, res) => {
  try {
    const db = await pool.query("SELECT NOW()")
      .then(() => "connected")
      .catch(() => "error");

    return res.json({
      ok: true,
      version: "1.0",
      uptime: process.uptime(),
      db
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      version: "1.0",
      uptime: process.uptime(),
      db: "error"
    });
  }
});

// 5️⃣ SAFER REDIRECT (last)
app.get('/:code', async (req, res, next) => {
  const { code } = req.params;

  // reserved paths → should NOT behave like shortcodes
  const reserved = ["healthz", "api", "assets", "favicon.ico"];

  if (reserved.includes(code)) {
    return next(); // let express handle normally
  }

  // Only allow real shortcodes
  if (!/^[A-Za-z0-9_-]{4,20}$/.test(code)) {
    return next();
  }

  try {
    const result = await pool.query(
      `SELECT url FROM links WHERE code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Not found");
    }

    const longUrl = result.rows[0].url;

    // update analytics
    await pool.query(
      `UPDATE links
       SET clicks = clicks + 1,
           last_accessed = NOW()
       WHERE code = $1`,
      [code]
    );

    return res.redirect(302, longUrl);

  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return res.status(500).send("Server error");
  }
});

// START SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
