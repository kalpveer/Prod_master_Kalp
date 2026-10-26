/* eslint-disable */
// GET /api/news
// Microsoft News via Bing RSS (same stack MSN uses). No public MSN consumer API exists.
// India + startup queries, filtered again on the server.

const FEEDS = [
  'https://www.bing.com/news/search?q=startup+india&format=rss&mkt=en-IN',
  'https://www.bing.com/news/search?q=Indian+startups+funding&format=rss&mkt=en-IN',
  'https://www.bing.com/news/search?q=DPIIT+startup+India&format=rss&mkt=en-IN',
];

const STARTUP = /startup|start-up|start up|founder|funding|seed fund|series [abc]|unicorn|dpiit|incubator|venture|grant|msme|entrepreneur/i;
const INDIA = /india|indian|bengaluru|bangalore|mumbai|delhi|hyderabad|chennai|pune|gujarat|noida|gurgaon|gurugram|dpiit/i;
const CACHE_MS = 10 * 60 * 1000;

export interface NewsItem {
  title: string;
  href: string;
  source: string;
  summary: string;
  image: string | null;
  published: string | null;
}

let cache: { at: number; items: NewsItem[] } | null = null;

const decode = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '').trim();

const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<(?:News:)?${name}[^>]*>([\\s\\S]*?)</(?:News:)?${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

function articleUrl(link: string) {
  try {
    const u = new URL(link);
    return u.searchParams.get('url') || link;
  } catch {
    return link;
  }
}

async function readFeed(url: string): Promise<NewsItem[]> {
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ProducticaNews/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });
  if (!r.ok) return [];
  const xml = await r.text();
  const items: NewsItem[] = [];
  for (const block of xml.split('<item>').slice(1)) {
    const title = tag(block, 'title');
    const href = articleUrl(tag(block, 'link'));
    if (!title || !href) continue;
    const blob = `${title} ${tag(block, 'description')}`;
    if (!STARTUP.test(blob)) continue;
    items.push({
      title,
      href,
      source: tag(block, 'Source') || 'Microsoft News',
      summary: tag(block, 'description').slice(0, 220),
      image: tag(block, 'Image').replace(/^http:\/\//, 'https://') || null,
      published: tag(block, 'pubDate') || null,
    });
  }
  return items;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'public, max-age=300');

  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return res.status(200).json({ items: cache.items, source: 'microsoft-news' });
    }

    const batches = await Promise.all(FEEDS.map(url => readFeed(url).catch(() => [])));
    const seen = new Set<string>();
    const items: NewsItem[] = [];
    for (const row of batches.flat()) {
      const key = row.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(row);
    }
    items.sort((a, b) => {
      const aIndia = INDIA.test(`${a.title} ${a.summary}`) ? 1 : 0;
      const bIndia = INDIA.test(`${b.title} ${b.summary}`) ? 1 : 0;
      return bIndia - aIndia;
    });
    items.splice(12);

    cache = { at: Date.now(), items };
    return res.status(200).json({ items, source: 'microsoft-news' });
  } catch (e) {
    console.error('[news]', e);
    return res.status(200).json({ items: cache?.items ?? [], source: 'microsoft-news' });
  }
}
