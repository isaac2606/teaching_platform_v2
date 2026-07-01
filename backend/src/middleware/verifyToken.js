const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-access-token'];
  const token = authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer '))
    ? authHeader.split(' ')[1]
    : authHeader;
  
  if (!token) {
    return res.status(401).json('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    /*res.json({
      messages:req.user
    })*/
    next();
  } catch (err) {
    res.status(403).json('Token is invalid or expired');
  }
};



module.exports =verifyToken;