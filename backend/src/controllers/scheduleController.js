const { getDailySchedule } = require('../services/scheduleService');

function getSchedule(req, res, next) {
  try {
    let { date } = req.query;
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    const schedule = getDailySchedule(date);
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSchedule,
};
