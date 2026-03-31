const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/image\/(jpeg|jpg|png|webp)/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images Only"));
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});


// const upload = multer({ storage, fileFilter });

const upload = (fieldName) => (req, res, next) => {
  multerInstance.single(fieldName)(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

module.exports = { upload };
