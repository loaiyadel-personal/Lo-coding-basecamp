const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.admin = decoded;

    // Sliding session: issue a fresh 15-min token on every authenticated request
    const refreshed = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.setHeader('X-Refresh-Token', refreshed);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired — please log in again' });
  }
};

module.exports = { protect };
