import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Sparkles } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [feedTitle, setFeedTitle] = useState('Discover'); // Default title
  const [loading, setLoading] = useState(true); // Start loading immediately

  // 1. ON LOAD: Fetch the Feed
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/feed');
      setProducts(response.data.items);
      setFeedTitle(`Trending in ${response.data.topic}`);
    } catch (error) {
      console.error("Feed Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. ON SEARCH: Override the feed
  const searchUnicart = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setProducts([]); 
    setFeedTitle(`Results for "${query}"`); // Update title

    try {
      const response = await axios.get(`http://localhost:3000/api/search?q=${query}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-her-bg text-stone-800 font-sans">
      
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-light tracking-widest text-her-red mb-8 uppercase cursor-pointer"
        onClick={loadFeed} // Clicking title reloads the feed
      >
        Unicart
      </motion.h1>

      {/* Search Bar */}
      <form onSubmit={searchUnicart} className="w-full max-w-lg relative z-10 mb-12">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search for anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-stone-300 rounded-full py-4 px-8 text-lg focus:outline-none focus:ring-2 focus:ring-her-red/30 transition-all shadow-lg text-stone-700 placeholder-stone-400"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-her-red text-white rounded-full hover:bg-red-500 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </form>

      {/* Dynamic Section Title */}
      <div className="w-full max-w-6xl mb-6 flex items-center gap-2 text-stone-500 uppercase tracking-widest text-sm font-bold">
        <Sparkles size={16} className="text-her-red" />
        {feedTitle}
      </div>

      {/* Product Feed Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode='wait'>
          {loading ? (
             // Loading Skeletons
             [...Array(6)].map((_, i) => (
                <motion.div 
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-80 bg-stone-200/50 rounded-2xl animate-pulse"
                />
             ))
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 flex flex-col justify-between border border-stone-100"
              >
                <div className="relative h-64 w-full mb-4 bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
                  <img src={product.image} alt={product.title} className="h-full object-contain mix-blend-multiply" />
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-stone-600 border border-stone-200">
                    {product.source}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium leading-tight text-stone-800 line-clamp-2 mb-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-light text-her-red">
                      {product.price}
                    </span>
                    <a 
                      href={product.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-bold text-stone-500 hover:text-her-red transition-colors"
                    >
                      BUY <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
