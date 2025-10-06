const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const cors = require('cors')
const jwt = require('jsonwebtoken')

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize app
const app = express()

// Middlewares
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Logging middleware (for development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Routes
app.use('/users', require('./routes/user.routes'))
app.use('/blogs', require('./routes/blog.routes'))

// Home route
app.get('/', (req, res) => {
  res.send(`Welcome to the Ibukunola's Blogging API. Kindly test this API with a REST client (POSTMAN or ThunderClient). Visit https://github.com/Mareola-Mabs/Blog-API for Documentation`)
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`))
