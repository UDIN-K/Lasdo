const db = require('../db/database');
const { DEFAULT_PRICING } = require('../config/constants');

function getPricing() {
  const row = db.prepare('SELECT * FROM pricing WHERE id = 1').get();
  if (!row) {
    return DEFAULT_PRICING;
  }
  return {
    futsal_day: row.futsal_day,
    futsal_night_weekend: row.futsal_night_weekend,
    serbaguna: row.serbaguna,
    updated_at: row.updated_at,
  };
}

function updatePricing({ futsal_day, futsal_night_weekend, serbaguna }) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE pricing 
    SET futsal_day = ?, futsal_night_weekend = ?, serbaguna = ?, updated_at = ?
    WHERE id = 1
  `).run(
    parseInt(futsal_day, 10),
    parseInt(futsal_night_weekend, 10),
    parseInt(serbaguna, 10),
    now
  );

  return getPricing();
}

module.exports = {
  getPricing,
  updatePricing,
};
