const {
  processChatbotMessage,
  predictCrowd,
  classifyIntent,
} = require('../services/aiService');
const { getAnalyticsSummary } = require('../services/analyticsService');

async function handleChatbot(req, res, next) {
  try {
    const { message } = req.body;
    const response = await processChatbotMessage(message);
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

function handleCrowdPrediction(req, res, next) {
  try {
    const { date, hour } = req.query;
    const result = predictCrowd(date, hour);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

function handleClassifyIntent(req, res, next) {
  try {
    const { text } = req.body;
    const result = classifyIntent(text);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

function handleGetAnalytics(req, res, next) {
  try {
    const summary = getAnalyticsSummary();
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleChatbot,
  handleCrowdPrediction,
  handleClassifyIntent,
  handleGetAnalytics,
};
