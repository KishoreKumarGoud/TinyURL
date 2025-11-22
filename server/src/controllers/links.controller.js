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
async function deleteLink(req, res) {
  try {
    const { code } = req.params;

    // delete row
    const del = await pool.query(
      'DELETE FROM links WHERE code = $1 RETURNING code',
      [code]
    );

    if (del.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    // success
    return res.status(200).json({ ok: true, code: del.rows[0].code });
  } catch (err) {
    console.error('DELETE /api/links/:code ERROR:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getLinkByCode(req, res) {
  try {
    const { code } = req.params;

    const result = await pool.query(
      'SELECT code, url, created_at, clicks, last_accessed FROM links WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("GET /api/links/:code ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function getAllLinks(req, res) {
  try {
    const result = await pool.query(
      "SELECT code, url, created_at,clicks,last_accessed FROM links ORDER BY id DESC"
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET /api/links ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllLinks,
  createLink,
  getLinkByCode,
  deleteLink
};

