const Comment = require("../models/Comment");

const addComment = async (req, res) => {
  try {
    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({ msg: "Comment Cannot Be Empty" });
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: req.params.id,
    });

    await comment.populate("author", "name");

    req.io.to(req.params.id).emit("new_comment", comment);

    res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name")
      .populate("replies.author", "name")
      .sort("createdAt");

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment Not Found" });
    }

    const isOwner = comment.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not Allowed" });
    }

    await comment.deleteOne();

    res.status(200).json({ msg: "Comment Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment Not Found" });
    }

    const uid = req.user._id.toString();
    const idx = comment.likes.findIndex((id) => id.toString() === uid);

    if (idx === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(idx, 1);
    }

    await comment.save();

    res.status(200).json({
      likes: comment.likes.length,
      liked: idx === -1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const addReply = async (req, res) => {
  try {
    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({ msg: "Reply Cannot Be Empty" });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment Not Found" });
    }

    comment.replies.push({ content, author: req.user._id });

    await comment.save();

    await comment.populate("replies.author", "name");

    const reply = comment.replies[comment.replies.length - 1];

    req.io.to(comment.post.toString()).emit("new_reply", {
      commentId: comment._id,
      reply,
    });

    res.status(201).json(reply);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const deleteReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment Not Found" });
    }

    const reply = comment.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ msg: "Reply Not Found" });
    }

    const isOwner = reply.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not Allowed" });
    }

    reply.deleteOne();

    await comment.save();

    res.status(200).json({ msg: "Reply Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const likeReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment Not Found" });
    }

    const reply = comment.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ msg: "Reply Not Found" });
    }

    const uid = req.user._id.toString();
    const idx = reply.likes.findIndex((id) => id.toString() === uid);

    if (idx === -1) {
      reply.likes.push(req.user._id);
    } else {
      reply.likes.splice(idx, 1);
    }

    await comment.save();

    res.status(200).json({
      likes: reply.likes.length,
      liked: idx === -1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  likeComment,
  addReply,
  deleteReply,
  likeReply,
};
