import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Search, TrendingUp, DollarSign } from 'lucide-react';
import { logoutSuccess } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logoutSuccess());
    navigate('/login');
  };

  // Debounced Search inside Navbar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/stocks/search?q=${searchQuery}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol) => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/stock/${symbol}`);
  };

  return (
    <nav className="h-16 border-b border-dark-border bg-dark-card px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <TrendingUp className="h-6 w-6 text-bull-green" />
        <span className="font-bold text-lg tracking-wider text-white">
          SB <span className="text-bull-green">STOCKS</span>
        </span>
      </Link>

      {/* Center Search Bar with Dropdown */}
      <div className="hidden md:block relative w-96 select-none" ref={dropdownRef}>
        <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 focus-within:border-bull-green/50 transition-colors">
          <Search className="h-4 w-4 text-dark-text-muted" />
          <input
            type="text"
            placeholder="Search stocks (e.g. AAPL, MSFT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white w-full outline-none placeholder:text-dark-text-muted"
          />
          {isSearching && (
            <div className="h-3.5 w-3.5 border-2 border-bull-green border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Dropdown list */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-dark-border bg-dark-card rounded-lg shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-1">
            {searchResults.map((item) => (
              <div
                key={item.symbol}
                onClick={() => handleSelectStock(item.symbol)}
                className="flex items-center justify-between p-2 rounded hover:bg-dark-bg cursor-pointer group transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-bull-green transition-colors">
                    {item.symbol}
                  </p>
                  <p className="text-[9px] text-dark-text-muted max-w-[200px] truncate">
                    {item.description}
                  </p>
                </div>
                <span className="text-[9px] bg-dark-border px-1.5 py-0.5 rounded text-dark-text-muted">Stock</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side: Account Balance & Profile */}
      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-2 bg-dark-bg/60 border border-dark-border px-3 py-1.5 rounded-lg">
            <DollarSign className="h-4 w-4 text-bull-green" />
            <span className="text-xs text-dark-text-muted mr-1">Virtual Balance:</span>
            <span className="text-sm font-semibold text-white">
              ${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        )}

        {/* Profile Dropdown */}
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-full bg-dark-border border border-bull-green/30 flex items-center justify-center text-bull-green font-semibold overflow-hidden group-hover:border-bull-green transition-all">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm text-white font-medium group-hover:text-bull-green transition-colors hidden sm:inline">
                {user.username}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-dark-text-muted hover:text-bear-red transition-colors p-1.5 rounded-lg hover:bg-dark-bg/50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-dark-text-muted hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-bull-green hover:bg-bull-green/90 text-dark-bg font-semibold text-sm px-4 py-1.5 rounded-lg transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
