const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // 1. Look for the token in the headers
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided!' });

  try {
    // 🚨 TRACKER 1: Print the token the frontend handed us
    console.log("👀 Frontend sent this token:", token); 
    
    // 2. Verify the token using your secret key
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next(); 
  } catch (error) {
    // 🚨 TRACKER 2: Print the exact reason jwt.verify crashed
    console.error("🚨 JWT Crash Reason:", error.message); 
    res.status(400).json({ message: 'Invalid Token' });
  }
}

module.exports = verifyToken;