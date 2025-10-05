const User = require('../models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()


exports.signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const user = new User({ first_name, last_name, email, password })
    await user.save();
    res.status(201).json({ message: 'User created successfully' })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isValid = await user.comparePassword(password)
    if (!isValid) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    res.json({ token })
  } catch (err) {
    next(err)
  }
}
