const jwt = require('jsonwebtoken')
const User = require('../models/User')
require('dotenv').config()

const authMiddleware = async (req, res, next) => {
  try {
    // Expect Authorization header like: "Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request for later use
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: user not found' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' })
    }
    return res.status(401).json({ message: 'Invalid or missing token.' })
  }
}

module.exports = authMiddleware
