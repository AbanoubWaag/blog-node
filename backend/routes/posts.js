const express = require("express");
const { protect } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleSave,
  toggleLike,
} = require("../controllers/postController");
const { addComment, getComments } = require("../controllers/commentController");

const router = express.Router();

router.get("/", getPosts);

router.get("/:id", getPost);

router.post("/", protect, upload("photo"), createPost);

router.put("/:id", protect, upload("photo"), updatePost);

router.delete("/:id", protect, deletePost);

router.post("/:id/like", protect, toggleLike);

router.post("/:id/save", protect, toggleSave);

router.get("/:id/comments", getComments);

router.post("/:id/comments", protect, addComment);

module.exports = router;
