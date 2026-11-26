const express = require('express');
const router = express.Router();
const { handleChatbot } = require('../controllers/aiController');

// Public Chatbot FAQ
router.post('/chatbot', handleChatbot);

module.exports = router;
