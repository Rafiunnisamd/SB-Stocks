import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, RefreshCw, Star, BarChart3, Newspaper } from 'lucide-react';
import api from '../services/api.js';

const Market = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [trendingQuotes, setTrendingQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [watchlistSymbols, setWatchlistSymbols] = useState([]);

  const navigate = useNavigate();

  // Search stocks debounce
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/stocks/search?q=${searchQuery}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Failed to search stocks:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch initial trending data, news, and watchlist symbols
  const getMarketData = async () => {
    setLoadingNews(true);
    setLoadingQuotes(true);
    try {
      // Get market news
      const newsResponse = await api.get('/stocks/news');
      setNews(newsResponse.data);
      setLoadingNews(false);

      // Get user watchlist
      const wlResponse = await api.get('/watchlist');
      setWatchlistSymbols(wlResponse.data.symbols);

      // Get trending stock quotes (simulating dashboard list)
      const symbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META'];
      const quotesData = [];
      for (const sym of symbols) {
        const qRes = await api.get(`/stocks/quote/${sym}`);
        const pRes = await api.get(`/stocks/profile/${sym}`);
        quotesData.push({
          symbol: sym,
          name: pRes.data.name || sym,
          logo: pRes.data.logo,
          price: qRes.data.c,
          change: qRes.data.d,
          changePercent: qRes.data.dp,
        });
      }
      setTrendingQuotes(quotesData);
    } catch (err) {
      console.error('Failed to fetch market data:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    getMarketData();
  }, []);

  const handleWatchlistToggle = async (e, symbol) => {
    e.stopPropagation(); // Avoid navigating
    const isWatched = watchlistSymbols.includes(symbol);
    try {
      if (isWatched) {
        await api.post('/watchlist/remove', { symbol });
        setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
      } else {
        await api.post('/watchlist/add', { symbol });
        setWatchlistSymbols(prev => [...prev, symbol]);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Market</h1>
          <p className="text-xs text-dark-text-muted mt-1">Explore real-time quotes, news, and search indices</p>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-full md:w-96 select-none z-20">
          <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-3 py-2 focus-within:border-bull-green/50 transition-colors">
            <Search className="h-4 w-4 text-dark-text-muted" />
            <input
              type="text"
              placeholder="Search by symbol or name (e.g. AAPL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white w-full outline-none placeholder:text-dark-text-muted"
            />
            {isSearching && <div className="h-4 w-4 border-2 border-bull-green border-t-transparent rounded-full animate-spin" />}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border border-dark-border bg-dark-card shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1">
              {searchResults.map((res) => (
                <div
                  key={res.symbol}
                  onClick={() => navigate(`/stock/${res.symbol}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-dark-bg cursor-pointer group transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-bull-green transition-colors">{res.symbol}</p>
                    <p className="text-[10px] text-dark-text-muted max-w-[240px] truncate">{res.description}</p>
                  </div>
                  <span className="text-[10px] bg-dark-border px-2 py-0.5 rounded text-dark-text-muted">Common Stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Watchlist details and Trending widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Stocks */}
        <div className="lg:col-span-2 rounded-xl bg-dark-card border border-dark-border p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-dark-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-bull-green" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Trending Stocks</h2>
            </div>
            <button
              onClick={getMarketData}
              className="text-dark-text-muted hover:text-white p-1 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {loadingQuotes ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 bg-dark-bg/60 border border-dark-border/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingQuotes.map((q) => {
                const isUp = q.change >= 0;
                const isWatched = watchlistSymbols.includes(q.symbol);
                return (
                  <motion.div
                    key={q.symbol}
                    whileHover={{ scale: 1.01, y: -1 }}
                    onClick={() => navigate(`/stock/${q.symbol}`)}
                    className="p-4 rounded-xl border border-dark-border bg-dark-bg/40 hover:bg-dark-card-hover cursor-pointer flex justify-between items-center transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-dark-border flex items-center justify-center font-bold text-bull-green text-xs overflow-hidden border border-dark-border">
                        {q.logo ? (
                          <img
                            src={q.logo}
                            alt=""
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = q.symbol.slice(0, 2);
                            }}
                          />
                        ) : (
                          q.symbol.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white group-hover:text-bull-green transition-colors">{q.symbol}</p>
                          <button
                            onClick={(e) => handleWatchlistToggle(e, q.symbol)}
                            className={`p-0.5 rounded-full ${isWatched ? 'text-primary-gold' : 'text-dark-text-muted hover:text-white'}`}
                          >
                            <Star className="h-3 w-3 fill-current" />
                          </button>
                        </div>
                        <p className="text-[10px] text-dark-text-muted max-w-[120px] truncate">{q.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${q.price.toFixed(2)}</p>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-bull-green' : 'text-bear-red'}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Market News */}
        <div className="rounded-xl bg-dark-card border border-dark-border p-6 flex flex-col justify-between h-[420px]">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
              <Newspaper className="h-5 w-5 text-bull-green" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Market News</h2>
            </div>

            {loadingNews ? (
              <div className="space-y-4 py-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-3/4 bg-dark-border rounded"></div>
                    <div className="h-2 w-1/2 bg-dark-border rounded"></div>
                  </div>
                ))}
              </div>
            ) : news.length === 0 ? (
              <p className="text-xs text-dark-text-muted py-10 text-center">No news items found.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block space-y-1 group border-b border-dark-border/30 pb-3 last:border-0"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-bull-green transition-colors leading-relaxed">
                      {item.headline}
                    </p>
                    <div className="flex justify-between text-[9px] text-dark-text-muted">
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
