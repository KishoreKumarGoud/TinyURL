const express = require('express');
const router = express.Router();

// controllers (we will implement next)
const { createLink } = require('../controllers/links.controller');
const { getAllLinks } = require('../controllers/links.controller');

router.get('/', getAllLinks);

// POST /api/links  → Create short link
router.post('/', createLink);

module.exports = router;
