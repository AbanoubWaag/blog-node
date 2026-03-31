const { scrapeArticle } = require("../services/scraper");

const scrape = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ msg: "URL Is Required" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ msg: "Invalid URL" });
    }

    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ msg: "Only http/https URLs Allowed" });
    }

    const data = await scrapeArticle(url);

    if (!data.title && !data.content) {
      return res.status(422).json({ msg: "Could Not Extract Content From This Page" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error);

    const msg =
      error.code === "ECONNREFUSED" || error.code === "ENOTFOUND"
        ? "Could Not Reach That URL"
        : error.response?.status === 403
        ? "This Website Blocks Scraping"
        : error.response?.status === 404
        ? "Page Not Found"
        : error.code === "ECONNABORTED"
        ? "Request Timed Out"
        : `Failed To Fetch Article: ${error.message}`;

    res.status(422).json({ msg });
  }
};

module.exports = {
  scrape,
};
