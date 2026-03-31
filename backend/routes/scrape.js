const express = require("express");
const { protect } = require("../middlewares/auth");
const { scrape } = require("../controllers/scrapeController");

const router = express.Router();

router.post("/", protect, scrape);

module.exports = router;
