const Blog = require('../models/Blog');
const calculateReadingTime = require('../utils/readingTime')

// Create blog
exports.createBlog = async (req, res, next) => {
  try {
    const { title, description, body, tags } = req.body
    const reading_time = calculateReadingTime(body)
    const blog = new Blog({ title, description, body, tags, author: req.user.id, reading_time })
    await blog.save()
    res.status(201).json(blog)
  } catch (err) {
    next(err)
  }
};

// Update blog (draft/published)
exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findOne({ _id: id, author: req.user.id })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    Object.assign(blog, req.body);
    if (req.body.body) blog.reading_time = calculateReadingTime(req.body.body)
    await blog.save()
    res.json(blog)
  } catch (err) {
    next(err)
  }
};

// Delete blog
exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOneAndDelete({ _id: id, author: req.user.id })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    next(err)
  }
};

// Get blog by ID (update read count)
exports.getBlog = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id).populate('author', 'first_name last_name email');
    if (!blog || blog.state !== 'published') return res.status(404).json({ message: 'Blog not found' });

    blog.read_count += 1
    await blog.save()
    res.json(blog)
  } catch (err) {
    next(err)
  }
};

// List blogs (paginated, filter, search, sort)
exports.listBlogs = async (req, res, next) => {
  try {
    let { page = 1, limit = 20, state, author, title, tags, sortBy, order = 'desc' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit)

    const filter = { state: 'published' }
    if (state) filter.state = state
    if (author) filter.author = author
    if (title) filter.title = { $regex: title, $options: 'i' }
    if (tags) filter.tags = { $in: tags.split(',') }

    const sortOptions = {}
    if (sortBy && ['read_count', 'reading_time', 'createdAt'].includes(sortBy)) {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1
    } else sortOptions.createdAt = -1

    const blogs = await Blog.find(filter)
      .populate('author', 'first_name last_name email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Blog.countDocuments(filter);
    res.json({ total, page, pages: Math.ceil(total / limit), blogs })
  } catch (err) {
    next(err)
  }
};

// List user’s blogs
exports.listUserBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user.id }).sort({ createdAt: -1 })
    res.json(blogs)
  } catch (err) {
    next(err)
  }
}
