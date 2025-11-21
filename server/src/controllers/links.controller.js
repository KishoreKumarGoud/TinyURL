const { createLinkService } = require('../services/links.service');

async function createLink(req, res) {
  try {
    const { url, code } = req.body;

    // call the service function
    const result = await createLinkService(url, code);

    return res.status(201).json(result);
 } catch (err) {
  console.error("POST /api/links ERROR:", err); // <-- Add this

  if (err.code === 'DUPLICATE_CODE') {
    return res.status(409).json({ error: 'Code already exists' });
  }

  return res.status(500).json({ error: err.message || 'Server error' });
}

}

module.exports = { createLink };
