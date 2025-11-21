require('dotenv').config();
const express = require('express');

// const pool = require('./db/pool');

// console.log("DATABASE_URL:", process.env.DATABASE_URL);


// // TEMPORARY TEST
// pool.query('SELECT NOW()')
//   .then(res => console.log("DB connected successfully at:", res.rows[0].now))
//   .catch(err => console.error("DB connection error:", err));


const app = express();

// parse JSON
app.use(express.json());

// health endpoint required for assignment
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// placeholder redirect (we will implement properly later)
app.get('/:code', (req, res) => {
  return res.status(404).send('Not found');
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
