const mongoose = require('mongoose')
const logger = console // replace with winston or pino if preferred
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    logger.log('MongoDB Connected')
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
