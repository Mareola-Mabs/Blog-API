# 📝 Blogging API

A RESTful API built with **Node.js**, **Express**, and **MongoDB** that allows users to create, manage, and publish blog posts.  
This API supports **JWT-based authentication**, **pagination**, **searching**, **filtering**, and **ordering** of blog posts.

---

## 🚀 Features

- User authentication with **JWT** (expires after 1 hour)
- **Public** and **Private** blog access
- Blog states: `draft` and `published`
- Pagination (default: 20 blogs per page)
- Searchable by **author**, **title**, or **tags**
- Orderable by **read_count**, **reading_time**, and **timestamp**
- Auto-increment `read_count` when a blog is viewed
- Reading time automatically calculated
- CRUD operations for blog owners
- Uses **MVC pattern** for clean architecture

---

## 🛠️ Tech Stack

- **Backend Framework:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Token)
- **Environment Variables:** dotenv
- **Logger:** morgan
- **Security & CORS:** cors
- **Testing:** Jest / Supertest (optional)

---

## 📦 Installation

### 1️⃣ Clone the Repository
```bash
https://github.com/Mareola-Mabs/Blog-API
cd Blog-API
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Create a .env File
```bash
touch .env
```

Add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

⚠️ Ensure your MongoDB connection string is correct.

### ▶️ Running the Server

**Development Mode**
```bash
npm run dev
```

**Production Mode**
```bash
npm start
```

Server will run on:

```
http://localhost:5000
```

---

## 📁 Project Structure

```
.
├── config/
│   ├── db.js            # MongoDB connection
│   └── jwt.js           # JWT helpers (sign/verify)
├── controllers/
│   ├── blog.controller.js
│   └── user.controller.js
├── models/
│   ├── Blog.js
│   └── User.js
├── routes/
│   ├── blog.routes.js
│   └── user.routes.js
├── middlewares/
│   └── auth.middleware.js
├── server.js
├── package.json
└── README.md
```

---

## 🔑 Authentication

This API uses JWT for authentication.

### Login to Get Token

Once a user logs in, you’ll receive a JWT token.

Add it to your headers for protected routes:

```
Authorization: Bearer <your_token>
```

Tokens expire after 1 hour.

---

## 🧍 User Endpoints

### 1️⃣ Register a User
**POST** `/users/signup`

**Request Body:**
```json
{
  "first_name": "Mareola",
  "last_name": "Plate",
  "email": "mareola@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "<jwt_token>"
}
```

### 2️⃣ Login User
**POST** `/users/login`

**Request Body:**
```json
{
  "email": "mareola@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "<jwt_token>"
}
```

---

## 📰 Blog Endpoints

### 1️⃣ Get All Published Blogs (Public)
**GET** `/blogs?state=published&page=1&limit=20&author=mike&order_by=read_count`

Supports:
- Pagination → page, limit  
- Filtering → state  
- Searching → author, title, tags  
- Ordering → read_count, reading_time, timestamp  

### 2️⃣ Get a Single Blog (Public)
**GET** `/blogs/:id`

Automatically:
- Increments read_count by 1  
- Returns author details  

**Response:**
```json
{
  "title": "How to Learn Node.js",
  "description": "A beginner guide",
  "author": {
    "first_name": "Mareola",
    "last_name": "Plate"
  },
  "read_count": 45,
  "reading_time": "3 mins",
  "state": "published",
  "tags": ["nodejs", "backend"],
  "body": "Full blog content..."
}
```

### 3️⃣ Create a Blog (Authenticated)
**POST** `/blogs`

**Header:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "My First Blog",
  "description": "Introduction to blogging",
  "tags": ["intro", "blog"],
  "body": "This is my first blog post."
}
```

Created blogs start as draft.

### 4️⃣ Publish a Blog (Authenticated)
**PATCH** `/blogs/:id/state`

**Body:**
```json
{
  "state": "published"
}
```

### 5️⃣ Edit a Blog (Authenticated, Owner Only)
**PUT** `/blogs/:id`

**Body:**
```json
{
  "title": "Updated Blog Title",
  "body": "Updated blog content."
}
```

### 6️⃣ Delete a Blog (Authenticated, Owner Only)
**DELETE** `/blogs/:id`

Deletes the blog completely from the database.

### 7️⃣ Get All Blogs by Logged-in User
**GET** `/blogs/my-blogs?state=draft&page=1`

Lists blogs created by the logged-in user.

---

## 🧮 Reading Time Algorithm

The reading time is estimated based on word count:

```js
const wordsPerMinute = 200
const readingTime = Math.ceil(wordCount / wordsPerMinute)
```

Result stored as: `"3 mins read"`.

---

## 🧪 Testing (Optional)

Run tests with:

```bash
npm test
```

You can use Jest or Supertest for endpoint testing.

---

## ☁️ Deployment

For Render or Vercel deployment:
1. Connect your GitHub repo.
2. Add environment variables under project settings.
3. Use the start command:

```bash
npm start
```

Render automatically detects Express and sets up a web service.

---

## 👨‍💻 Author

**Mareola**  
Software Engineer | Backend Developer | Tech Innovator

---

## 🧠 License

MIT License © 2025 Mareola
