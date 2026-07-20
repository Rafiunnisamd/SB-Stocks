import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, RefreshCw, Trash2, ArrowUpRight } from 'lucide-react';
import api from '../services/api.js';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getWatchlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/watchlist');
      setWatchlist(response.data.items);
    } catch (err) {
      console.error('Failed to get watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWatchlist();
  }, []);

  const handleRemove = async (e, symbol) => {
    e.stopPropagation(); // Avoid navigating to details page
    try {
      await api.post('/watchlist/remove', { symbol });
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Watchlist</h1>
          <p className="text-xs text-dark-text-muted mt-1">Keep track of your favorite indices and companies</p>
        </div>
        <button
          onClick={getWatchlist}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-dark-text-muted hover:text-white px-3 py-2 rounded-lg bg-dark-card border border-dark-border"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-dark-card border border-dark-border rounded-xl" />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-dark-border rounded-xl bg-dark-card/40 max-w-lg mx-auto">
          <Star className="h-10 w-10 text-dark-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
          <p className="text-sm text-dark-text-muted mt-2 px-6">
            Search for stocks on the Market page and click the star icon to keep track of their price changes here.
          </p>
          <button
            onClick={() => navigate('/market')}
            className="mt-6 bg-bull-green text-dark-bg font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-bull-green/90 transition-all shadow"
          >
            Search Stocks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => {
            const isUp = item.change >= 0;
            return (
              <motion.div
                key={item.symbol}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className="p-5 rounded-xl border border-dark-border bg-dark-card hover:bg-dark-card-hover hover:border-bull-green/20 cursor-pointer flex flex-col justify-between h-28 relative group transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center font-bold text-bull-green text-xs overflow-hidden">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = item.symbol.slice(0, 2);
                          }}
                        />
                      ) : (
                        item.symbol.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-bull-green transition-colors">
                        {item.symbol}
                      </h3>
                      <p className="text-[10px] text-dark-text-muted max-w-[120px] truncate">{item.companyName}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(e, item.symbol)}
                    className="opacity-0 group-hover:opacity-100 hover:text-bear-red text-dark-text-muted p-1.5 rounded transition-all"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <p className="text-base font-extrabold text-white">${item.price.toFixed(2)}</p>
                  <div className={`flex items-center text-xs font-semibold ${isUp ? 'text-bull-green' : 'text-bear-red'}`}>
                    {isUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    <span>
                      {isUp ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
