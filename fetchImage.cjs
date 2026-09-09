const https = require('https');

https.get('https://www.linkedin.com/pulse/rise-agentic-ai-productica-ai-kjtwe/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<meta property="og:image" content="([^"]+)"/);
    if (match) {
      console.log("FOUND_IMAGE:", match[1].replace(/&amp;/g, '&'));
    } else {
      console.log("NO_IMAGE_FOUND");
    }
  });
});
