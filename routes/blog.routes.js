const express = require('express')
const router = express.Router()
const Blog = require('../models/Blog')
const authMiddleware = require('../middlewares/auth.middleware')

// Utility: calculate reading time (1 min per 200 words)
const calcReadingTime = (text) => {
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}


// PUBLIC ROUTES


// GET all published blogs (with pagination, filtering, sorting, search)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      author,
      title,
      tags,
      order_by = 'timestamp',
      order = 'desc'
    } = req.query

    const filter = { state: 'published' }

    if (author) filter.author = new RegExp(author, 'i')
    if (title) filter.title = new RegExp(title, 'i')
    if (tags) filter.tags = { $in: tags.split(',').map(tag => tag.trim()) }

    const sortOptions = {}
    if (['read_count', 'reading_time', 'timestamp'].includes(order_by)) {
      sortOptions[order_by] = order === 'asc' ? 1 : -1
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'first_name last_name email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Blog.countDocuments(filter)

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      blogs
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET a single published blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, state: 'published' })
      .populate('author', 'first_name last_name email')

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or not published' })
    }

    // Increment read count
    blog.read_count += 1
    await blog.save()

    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PROTECTED ROUTES

// GET all blogs for logged-in user (filterable by state)
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const { state, page = 1, limit = 10 } = req.query
    const filter = { author: req.user._id }
    if (state) filter.state = state

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Blog.countDocuments(filter)

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      blogs
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// CREATE a new blog (default = draft)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, tags, body } = req.body

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' })
    }

    const blog = new Blog({
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      body,
      author: req.user._id,
      reading_time: calcReadingTime(body)
    })

    await blog.save()
    res.status(201).json(blog)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// UPDATE blog (only if owner)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    const updates = req.body
    Object.assign(blog, updates)

    // Recalculate reading time if body changed
    if (updates.body) {
      blog.reading_time = calcReadingTime(updates.body)
    }

    await blog.save()
    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUBLISH or change state of blog
router.patch('/:id/state', authMiddleware, async (req, res) => {
  try {
    const { state } = req.body
    if (!['draft', 'published'].includes(state)) {
      return res.status(400).json({ message: 'Invalid state' })
    }

    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    blog.state = state
    await blog.save()
    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE blog (only if owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user._id })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.status(200).json({ message: 'Blog deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
