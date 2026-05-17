const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // 1. Look for the token in the headers
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided!' });

  try {
    // 2. Verify the token using your secret key
    const verified = jwt.verify(token.replace("Bearer ", ""), 'MySuperSecretKey');
    req.user = verified;
    next(); // ID is valid! Let them through to see the orders.
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
}

module.exports = verifyToken;