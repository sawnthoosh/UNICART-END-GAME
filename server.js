require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());

// --- 1. THE SHARED ENGINE (Reusable) ---
async function searchShopping(query) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: Missing SERPER_API_KEY in .env file");
        return [];
    }

    const config = {
        method: 'post',
        url: 'https://google.serper.dev/shopping',
        headers: { 
            'X-API-KEY': apiKey, 
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            "q": query,
            "gl": "in",       // India
            "location": "India",
            "num": 20         // Get top 20 results
        })
    };

    try {
        console.log(`\n🚀 Engine: Hunting for "${query}"...`);
        const response = await axios.request(config);
        const rawItems = response.data.shopping || [];
        
        // Clean Data
        return rawItems.map(item => ({
            id: item.productId || Math.random().toString(36).substr(2, 9),
            title: item.title,
            price: item.price, 
            source: item.source,
            image: item.imageUrl,
            link: item.link,
            rating: item.rating || 0
        }));
    } catch (error) {
        console.error("❌ Engine Error:", error.message);
        return [];
    }
}

// --- 2. THE SEARCH API ---
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "No query provided" });
    
    const products = await searchShopping(query);
    res.json(products);
});

// --- 3. THE NEW FEED API (Discovery Engine) ---
const TRENDING_TOPICS = [
    "top rated sneakers india",
    "trending smartwatches 2025",
    "nothing phone 2a accessories",
    "aesthetic desk setup accessories",
    "best selling gaming mouse",
    "vintage casio watches"
];

app.get('/api/feed', async (req, res) => {
    // Pick a random topic to keep the app fresh
    const randomTopic = TRENDING_TOPICS[Math.floor(Math.random() * TRENDING_TOPICS.length)];
    
    console.log(`\n🌊 Generating Feed: ${randomTopic}`);
    const products = await searchShopping(randomTopic);

    res.json({
        topic: randomTopic.replace("top rated", "").replace("india", "").trim(),
        items: products
    });
});

// Start
app.listen(PORT, () => {
    console.log(`\n⚡️ UNICART ENGINE ONLINE at http://localhost:${PORT}`);
});
