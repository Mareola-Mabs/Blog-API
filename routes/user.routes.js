const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { generateToken, verifyToken } = require('../config/jwt')

const router = express.Router()

// @route   POST /api/users/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    
    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
    })

    await newUser.save()

    const token = generateToken(newUser)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// @route   POST /api/users/login
// @desc    Login a user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = generateToken(user)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// @route   GET /api/users/profile
// @desc    Get logged in user details (protected)
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router
