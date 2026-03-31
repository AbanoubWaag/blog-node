const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  deleteComment,
  likeComment,
  addReply,
  deleteReply,
  likeReply,
} = require("../controllers/commentController");

const router = express.Router();

router.delete("/:id", protect, deleteComment);

router.post("/:id/like", protect, likeComment);

router.post("/:id/replies", protect, addReply);

router.delete("/:id/replies/:replyId", protect, deleteReply);

router.post("/:id/replies/:replyId/like", protect, likeReply);

module.exports = router;
