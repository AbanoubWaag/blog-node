const Parser  = require('@postlight/parser');
const axios   = require('axios');
const cheerio = require('cheerio');
const https   = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

// Strip HTML tags from Postlight content
const stripHtml = (html) => html ? html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, '\n').trim() : '';

// Fallback: raw axios + cheerio
const scrapeRaw = async (url) => {
  const { data } = await axios.get(url, {
    timeout: 15000,
    maxRedirects: 5,
    httpsAgent: agent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  const $ = cheerio.load(data);
  $('script, style, nav, footer, header, aside, iframe, noscript').remove();

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() || '';

  const ogImage = $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content');
  let imageUrl = '';
  if (ogImage) { try { imageUrl = new URL(ogImage, url).href; } catch {} }
  if (!imageUrl) {
    $('img').each((_, el) => {
      if (imageUrl) return;
      const src = $(el).attr('src') || '';
      if (src && src.length > 10 && !src.includes('logo') && !src.includes('icon')) {
        try { imageUrl = new URL(src, url).href; } catch {}
      }
    });
  }

  const candidates = ['article', 'main', '[role="main"]', '.post-content', '.article-body', '.entry-content', '.content', '#content', 'body'];
  let contentEl = null;
  for (const sel of candidates) {
    const el = $(sel).first();
    if (el.length) { contentEl = el; break; }
  }
  const paragraphs = [];
  contentEl.find('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 30) paragraphs.push(text);
  });
  if (!paragraphs.length) {
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) paragraphs.push(text);
    });
  }

  return { title: title.trim(), content: paragraphs.join('\n\n').trim(), imageUrl };
};

const scrapeArticle = async (url) => {
  // Try Postlight first — handles most sites well
  try {
    const result = await Parser.parse(url, {
      fetchOptions: { httpsAgent: agent, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } },
    });
    if (result && (result.title || result.content)) {
      return {
        title:    result.title    || '',
        content:  stripHtml(result.content || ''),
        imageUrl: result.lead_image_url || '',
      };
    }
  } catch (_) {}

  // Fallback to raw scraper
  return scrapeRaw(url);
};

module.exports = { scrapeArticle };
