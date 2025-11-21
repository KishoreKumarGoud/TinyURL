const pool = require('../db/pool');
const { createLinkService } = require('../services/links.service');

async function createLink(req, res) {
  try {
    const { url, code } = req.body;

    const result = await createLinkService(url, code);

    return res.status(201).json(result);
  } catch (err) {
    console.error("POST /api/links ERROR:", err);

    if (err.code === 'DUPLICATE_CODE') {
      return res.status(409).json({ error: 'Code already exists' });
    }

    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

async function getAllLinks(req, res) {
  try {
    const result = await pool.query(
      "SELECT code, url, created_at FROM links ORDER BY id DESC"
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET /api/links ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createLink, getAllLinks };
