# Blog App

A full-stack blog application built with **Node.js**, **Express**, **MongoDB**, and vanilla **HTML/CSS/JS**. Features real-time comments and likes via **Socket.IO**, article scraping, image uploads, and JWT authentication.

---

## Features

- **Authentication** — Register & login with JWT tokens, role-based access (user / admin)
- **Posts** — Create, read, update, delete posts with image upload or URL import
- **Comments & Replies** — Nested comments with like/delete support
- **Real-time** — New comments, replies, and likes update live via Socket.IO
- **Article Scraper** — Import title, content, and image from any article URL
- **Image Uploads** — Upload photos (JPEG, PNG, WebP, max 5MB) or use a URL
- **Pagination** — Posts are paginated (9 per page)
- **Admin Controls** — Admins can delete any post or comment

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Node.js, Express 5, Mongoose            |
| Database  | MongoDB                                 |
| Auth      | JSON Web Tokens (JWT), bcrypt           |
| Realtime  | Socket.IO                               |
| Scraping  | @postlight/parser, axios, cheerio       |
| Uploads   | Multer                                  |
| Frontend  | Vanilla HTML, CSS, JavaScript           |

---

## Project Structure

```
blog/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register & login
│   │   ├── commentController.js# Comments & replies CRUD + likes
│   │   ├── postController.js   # Posts CRUD + likes + save
│   │   └── scrapeController.js # Article URL scraper
│   ├── middlewares/
│   │   ├── auth.js             # JWT protect & adminOnly
│   │   └── upload.js           # Multer image upload
│   ├── models/
│   │   ├── Comment.js          # Comment & reply schemas
│   │   ├── Post.js             # Post schema
│   │   └── User.js             # User schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── comments.js
│   │   ├── posts.js
│   │   └── scrape.js
│   ├── services/
│   │   └── scraper.js          # Postlight + cheerio scraping logic
│   ├── uploads/                # Uploaded images (gitignored)
│   ├── .env
│   └── server.js               # Entry point
└── frontend/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── api.js              # Shared fetch helper, auth utils
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   ├── post.html           # Single post view + comments
    │   └── post-form.html      # Create / edit post
    └── index.html              # Posts listing
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd blog/backend

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit backend/.env with your values (see below)

# 4. Start the server
npm run dev      # development (nodemon)
# or
npm start        # production
```

### Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogdb
JWT_SECRET=your_strong_secret_here
```

> The server will refuse to start if `JWT_SECRET` is missing or left as the default placeholder.

### Open the App

Navigate to [http://localhost:5000](http://localhost:5000) in your browser.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint    | Body                          | Description     |
|--------|-------------|-------------------------------|-----------------|
| POST   | `/register` | `name, email, password, role` | Create account  |
| POST   | `/login`    | `email, password`             | Login, get token|

### Posts — `/api/posts`

| Method | Endpoint         | Auth | Description              |
|--------|------------------|------|--------------------------|
| GET    | `/`              | —    | List posts (paginated)   |
| GET    | `/:id`           | —    | Get single post          |
| POST   | `/`              | ✓    | Create post              |
| PUT    | `/:id`           | ✓    | Update post              |
| DELETE | `/:id`           | ✓    | Delete post              |
| POST   | `/:id/like`      | ✓    | Toggle like              |
| POST   | `/:id/save`      | ✓    | Toggle save              |
| GET    | `/:id/comments`  | —    | Get comments for post    |
| POST   | `/:id/comments`  | ✓    | Add comment to post      |

### Comments — `/api/comments`

| Method | Endpoint                        | Auth | Description       |
|--------|---------------------------------|------|-------------------|
| DELETE | `/:id`                          | ✓    | Delete comment    |
| POST   | `/:id/like`                     | ✓    | Toggle like       |
| POST   | `/:id/replies`                  | ✓    | Add reply         |
| DELETE | `/:id/replies/:replyId`         | ✓    | Delete reply      |
| POST   | `/:id/replies/:replyId/like`    | ✓    | Toggle reply like |

### Scrape — `/api/scrape`

| Method | Endpoint | Auth | Body  | Description              |
|--------|----------|------|-------|--------------------------|
| POST   | `/`      | ✓    | `url` | Scrape article from URL  |

---

## Socket.IO Events

| Event          | Direction       | Payload                          |
|----------------|-----------------|----------------------------------|
| `join_post`    | client → server | `postId`                         |
| `leave_post`   | client → server | `postId`                         |
| `new_comment`  | server → client | comment object                   |
| `new_reply`    | server → client | `{ commentId, reply }`           |
| `like_updated` | server → client | `{ postId, likes }`              |
