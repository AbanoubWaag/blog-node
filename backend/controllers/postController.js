const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res) => {
  try {
    let photo = "";
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      photo = req.body.imageUrl;
    }

    const post = await Post.create({
      ...req.body,
      photo,
      author: req.user._id,
    });

    /*
  {
      data.
  }
    */
    res.status(201).json({
      msg: "Post Created",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const getPosts = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    const [posts, total] = await Promise.all([
      Post.find()
        .populate("author", "name")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(),
    ]);

    res.status(200).json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");

    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not Allowed" });
    }

    const update = { ...req.body };
    if (req.file) {
      update.photo = `/uploads/${req.file.filename}`;
    }

    const updated = await Post.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      msg: "Post Updated",
      data: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not Allowed" });
    }

    await post.deleteOne();

    res.status(200).json({ msg: "Post Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }

    const user = await User.findById(req.user._id);

    const idx = user.savedPosts.findIndex((id) => id.toString() === req.params.id);

    if (idx === -1) {
      user.savedPosts.push(req.params.id);
    } else {
      user.savedPosts.splice(idx, 1);
    }

    await user.save();

    const saved = idx === -1;

    res.status(200).json({
      saved,
      savedCount: user.savedPosts.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }

    const uid = req.user._id.toString();
    const idx = post.likes.findIndex((id) => id.toString() === uid);

    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }

    await post.save();

    const liked = idx === -1;

    req.io.to(req.params.id).emit("like_updated", {
      postId: req.params.id,
      likes: post.likes.length,
    });

    res.status(200).json({
      likes: post.likes.length,
      liked,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleSave,
  toggleLike,
};
