require('dotenv').config();
const express = require('express');
const pool = require('./db/pool');

const app = express();

// parse JSON
app.use(express.json());

// API routes
const linksRouter = require('./routes/links.routes');
app.use('/api/links', linksRouter);

// health endpoint required for assignment
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// redirect route — MUST be after API routes
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      'SELECT url FROM links WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Not found');
    }

    const longUrl = result.rows[0].url;

    return res.redirect(302, longUrl);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    return res.status(500).send('Server error');
  }
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
