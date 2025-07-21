const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;