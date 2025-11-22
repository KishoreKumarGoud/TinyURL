const express = require('express');
const router = express.Router();
const linksController = require('../controllers/links.controller');

// SAFETY LOG
console.log("Loaded linksController keys:", Object.keys(linksController));

router.get('/', linksController.getAllLinks);
router.post('/', linksController.createLink);

// For stats
router.get('/:code', linksController.getLinkByCode);

// For deletion
router.delete('/:code', linksController.deleteLink);

module.exports = router;
