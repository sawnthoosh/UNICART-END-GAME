// server.js
require('dotenv').config(); // Load the .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors()); // Allow frontend to talk to us

// 1. The Engine Function
async function searchShopping(query) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) throw new Error("API Key missing! Check .env file.");

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
        console.log(`\n🚀 Forwarding "${query}" to Serper...`);
        const response = await axios.request(config);
        return response.data.shopping || [];
    } catch (error) {
        console.error("❌ Serper Error:", error.message);
        return [];
    }
}

// 2. The API Endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    
    if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    // Call the engine
    const products = await searchShopping(query);
    
    // Normalize data (Make sure every item has the fields our UI expects)
    const cleanFeed = products.map(item => ({
        id: item.productId || Math.random().toString(36).substr(2, 9),
        title: item.title,
        price: item.price, 
        source: item.source,
        image: item.imageUrl,
        link: item.link,
        rating: item.rating || 0,
        reviews: item.reviewCount || 0
    }));

    console.log(`✅ Returned ${cleanFeed.length} items to Frontend.`);
    res.json(cleanFeed);
});

// 3. Start Server
app.listen(PORT, () => {
    console.log(`\n⚡️ UNICART SERVER ONLINE at http://localhost:${PORT}`);
    console.log(`👉 Test link: http://localhost:${PORT}/api/search?q=iphone+15`);
});
