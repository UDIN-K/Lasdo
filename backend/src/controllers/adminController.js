const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const { getPricing, updatePricing } = require('../services/pricingService');

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'lasdo2026';

function handleAdminLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password pengelola wajib diisi.',
      });
    }

    if (username.trim() !== ADMIN_USER || password !== ADMIN_PASS) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid. Silakan periksa kembali username dan password.',
      });
    }

    const token = jwt.sign(
      {
        username: ADMIN_USER,
        role: 'owner',
        name: 'Christino Hirasdo Wiryawan',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil! Selamat datang di Portal Pengelola Lasdo Family Futsal.',
      data: {
        token,
        admin: {
          username: ADMIN_USER,
          name: 'Christino Hirasdo Wiryawan',
          role: 'Pengelola UMKM',
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

function handleGetPricing(req, res, next) {
  try {
    const pricing = getPricing();
    res.json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    next(error);
  }
}

function handleUpdatePricing(req, res, next) {
  try {
    const { futsal_day, futsal_night_weekend, serbaguna } = req.body;

    if (!futsal_day || !futsal_night_weekend || !serbaguna) {
      return res.status(400).json({
        success: false,
        message: 'Semua nilai tarif sewa (futsal_day, futsal_night_weekend, serbaguna) wajib diisi.',
      });
    }

    const updated = updatePricing({
      futsal_day,
      futsal_night_weekend,
      serbaguna,
    });

    res.json({
      success: true,
      message: 'Master tarif sewa berhasil diperbarui. Tarif pesanan lama tetap terkunci aman.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleAdminLogin,
  handleGetPricing,
  handleUpdatePricing,
};
