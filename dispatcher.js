// dispatcher.js
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const { z } = require('zod');

// 1. SETUP: Put your API Key here directly for testing
const apiKey = "fc-68a630490431421c813e16f3eb6934f0"; 
const app = new FirecrawlApp({ apiKey: apiKey });

// 2. SCHEMA: Define what the data should look like
const productSchema = z.object({
  items: z.array(z.object({
    title: z.string(),
    price: z.number().describe("Price in INR number only"),
    source: z.enum(['amazon', 'flipkart', 'myntra']),
    link: z.string().url(),
  }))
});

// 3. THE ENGINE
async function searchUnicart(query) {
  console.log(`\n🚀 Searching Universe for: "${query}"...`);

  // The Search Dispatcher (Targeting India)
  const searchUrls = [
    `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
  ];

  try {
    const result = await app.extract(searchUrls, {
      prompt: "Extract the top 3 products. Ignore ads.",
      schema: productSchema,
    });

    if (!result.success) throw new Error(result.error);

    // Merge results
    const feed = result.data.items.sort((a, b) => a.price - b.price);
    console.log("✅ RESULTS FOUND:");
    console.log(JSON.stringify(feed, null, 2));

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// 4. RUN IT
searchUnicart("iPhone 15 128gb");
