const pool = require('../db/pool');
const { nanoid } = require('../utils/nanoid');

async function createLinkService(url, customCode) {
  const code = customCode || nanoid();

  // Check duplicates
  const check = await pool.query(
    'SELECT * FROM links WHERE code = $1',
    [code]
  );

  if (check.rows.length > 0) {
    const error = new Error('Duplicate short code');
    error.code = 'DUPLICATE_CODE';
    throw error;
  }

  // Insert into DB
  const result = await pool.query(
    'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url',
    [code, url]
  );

  return result.rows[0];
}

module.exports = { createLinkService };
