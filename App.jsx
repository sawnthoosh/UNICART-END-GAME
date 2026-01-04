import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Sparkles, RefreshCcw } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [feedTitle, setFeedTitle] = useState('Discover');
  const [loading, setLoading] = useState(true);

  // 1. Load Feed on Startup
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setQuery(''); // Clear search bar
    try {
      // Use your Codespace URL or localhost
      const response = await axios.get('http://localhost:3000/api/feed');
      setProducts(response.data.items);
      setFeedTitle(`Trending in ${response.data.topic}`);
    } catch (error) {
      console.error("Feed Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setFeedTitle(`Results for "${query}"`);
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
    <div className="min-h-screen bg-[#f3f0e9] p-8 flex flex-col items-center font-sans text-stone-800">
      
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={loadFeed}
        className="text-4xl font-light tracking-[0.2em] text-[#ff4d4d] mb-8 uppercase cursor-pointer hover:opacity-80 transition-opacity"
      >
        Unicart
      </motion.h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-lg relative z-10 mb-10">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search for anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/60 backdrop-blur-md border border-stone-300 rounded-full py-4 px-8 text-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/20 transition-all shadow-xl shadow-stone-200/50"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#ff4d4d] text-white rounded-full hover:bg-red-500 transition-colors shadow-lg">
            <Search size={20} />
          </button>
        </div>
      </form>

      {/* Feed Title & Refresh */}
      <div className="w-full max-w-6xl mb-6 flex items-center justify-between text-stone-500 uppercase tracking-widest text-xs font-bold px-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#ff4d4d]" />
          {feedTitle}
        </div>
        {!query && (
            <button onClick={loadFeed} className="flex items-center gap-2 hover:text-[#ff4d4d] transition-colors">
                <RefreshCcw size={14} /> Refresh Feed
            </button>
        )}
      </div>

      {/* Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {loading ? (
             // Skeletons
             [...Array(6)].map((_, i) => (
                <motion.div 
                  key={`skel-${i}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-72 bg-stone-200/50 rounded-2xl animate-pulse"
                />
             ))
          ) : (
            products.map((product, i) => (
              <motion.div
                key={product.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-4 shadow-lg shadow-stone-200/40 border border-stone-100 flex flex-col justify-between"
              >
                <div className="relative h-56 w-full mb-4 bg-stone-50 rounded-xl overflow-hidden p-4 flex items-center justify-center">
                  <img src={product.image} alt={product.title} className="h-full object-contain mix-blend-multiply" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-stone-500 border border-stone-200">
                    {product.source}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-stone-800 line-clamp-2 leading-snug mb-3">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-light text-[#ff4d4d]">{product.price}</span>
                    <a href={product.link} target="_blank" className="text-xs font-bold text-stone-400 hover:text-stone-800 flex items-center gap-1 transition-colors">
                      BUY <ExternalLink size={12} />
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
