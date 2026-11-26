const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lasdo_family_futsal_secret_key_2026_capstone_a26_cs150';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi pengelola tidak ditemukan.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Sesi pengelola telah berakhir atau token tidak valid. Silakan login kembali.',
    });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET,
};
