import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Building,
  Globe,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Volume2
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Area, Bar } from 'recharts';
import { updateUserBalance } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  
  // Trading states
  const [tradeType, setTradeType] = useState('BUY');
  const [sharesInput, setSharesInput] = useState('1');
  const [ownedShares, setOwnedShares] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [tradeError, setTradeError] = useState(null);
  
  // Success Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [executedTradeDetails, setExecutedTradeDetails] = useState(null);

  // Timeframe and Chart states
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const getStockDetails = async () => {
    setLoading(true);
    setTradeError(null);
    try {
      // Get Quote and Profile
      const qRes = await api.get(`/stocks/quote/${symbol}`);
      const pRes = await api.get(`/stocks/profile/${symbol}`);
      
      setQuote(qRes.data);
      setProfile(pRes.data);

      // Check Watchlist state
      const wlRes = await api.get('/watchlist');
      setIsWatched(wlRes.data.symbols.includes(symbol.toUpperCase()));

      // Check owned shares of this stock
      const holdingsRes = await api.get('/portfolio/holdings');
      const thisHolding = holdingsRes.data.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      );
      setOwnedShares(thisHolding ? thisHolding.shares : 0);
    } catch (err) {
      console.error('Failed to get stock details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candle data for the chart based on timeframe
  const getChartData = async () => {
    setLoadingChart(true);
    const to = Math.floor(Date.now() / 1000);
    let from = to - (86400 * 30); // Default 1M (30 days)
    let resolution = 'D';

    if (timeframe === '1W') {
      from = to - (86400 * 7);
      resolution = 'D';
    } else if (timeframe === '1M') {
      from = to - (86400 * 30);
      resolution = 'D';
    } else if (timeframe === '3M') {
      from = to - (86400 * 90);
      resolution = 'D';
    } else if (timeframe === '1Y') {
      from = to - (86400 * 365);
      resolution = 'W';
    }

    try {
      const response = await api.get(`/stocks/candles/${symbol}?resolution=${resolution}&from=${from}&to=${to}`);
      const data = response.data;
      
      if (data && data.t) {
        const formatted = data.t.map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          Price: data.c[index],
          Volume: data.v[index],
        }));
        setChartData(formatted);
      }
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    getStockDetails();
  }, [symbol]);

  useEffect(() => {
    getChartData();
  }, [symbol, timeframe]);

  const handleWatchlistToggle = async () => {
    try {
      if (isWatched) {
        await api.post('/watchlist/remove', { symbol });
        setIsWatched(false);
      } else {
        await api.post('/watchlist/add', { symbol });
        setIsWatched(true);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setTradeError(null);
    const sharesNum = parseFloat(sharesInput);

    if (isNaN(sharesNum) || sharesNum <= 0) {
      setTradeError('Please enter a valid positive number of shares.');
      return;
    }

    setIsExecuting(true);
    try {
      const response = await api.post('/trade/execute', {
        symbol: symbol.toUpperCase(),
        type: tradeType,
        shares: sharesNum,
      });

      dispatch(updateUserBalance(response.data.newBalance));
      setExecutedTradeDetails(response.data.transaction);
      setShowSuccessModal(true);
      setSharesInput('1');

      // Refresh data
      const holdingsRes = await api.get('/portfolio/holdings');
      const thisHolding = holdingsRes.data.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      );
      setOwnedShares(thisHolding ? thisHolding.shares : 0);
      getChartData(); // Reload chart to capture simulated movements
    } catch (err) {
      setTradeError(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-dark-bg text-white animate-pulse">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-bull-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-dark-text-muted">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!quote || !profile) {
    return (
      <div className="text-center py-20 bg-dark-bg text-white space-y-4">
        <p className="text-bear-red">Failed to load details for symbol {symbol}.</p>
        <button
          onClick={() => navigate('/market')}
          className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg"
        >
          Back to Market
        </button>
      </div>
    );
  }

  const isUp = quote.d >= 0;
  const currentPrice = quote.c;
  const enteredShares = parseFloat(sharesInput) || 0;
  const estimatedCost = parseFloat((enteredShares * currentPrice).toFixed(2));
  
  const canBuy = user && user.balance >= estimatedCost;
  const canSell = ownedShares >= enteredShares;
  const isFormInvalid = enteredShares <= 0 || (tradeType === 'BUY' ? !canBuy : !canSell);

  const timeframes = ['1W', '1M', '3M', '1Y'];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/market')}
          className="flex items-center gap-1.5 text-xs font-semibold text-dark-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Market</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWatchlistToggle}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
              isWatched
                ? 'bg-primary-gold/10 border-primary-gold text-primary-gold'
                : 'bg-dark-card border-dark-border text-dark-text-muted hover:text-white hover:bg-dark-card-hover'
            }`}
          >
            <Star className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
            <span>{isWatched ? 'Watched' : 'Watchlist'}</span>
          </button>
          <button
            onClick={() => {
              getStockDetails();
              getChartData();
            }}
            className="p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-card-hover text-dark-text-muted hover:text-white transition-colors"
            title="Refresh Quote"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stock Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-dark-card border border-dark-border rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center overflow-hidden font-extrabold text-bull-green text-lg p-1 border-bull-green/20">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = symbol.slice(0, 2);
                }}
              />
            ) : (
              symbol.slice(0, 2)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{symbol.toUpperCase()}</h1>
              <span className="text-xs bg-dark-border text-dark-text-muted px-2 py-0.5 rounded font-semibold uppercase">
                {profile.finnhubIndustry || 'Stock'}
              </span>
            </div>
            <p className="text-sm text-dark-text-muted mt-0.5">{profile.name}</p>
          </div>
        </div>

        <div className="sm:text-right">
          <h2 className="text-3xl font-extrabold text-white">${quote.c.toFixed(2)}</h2>
          <div className={`inline-flex items-center gap-1 text-sm font-bold mt-1 ${isUp ? 'text-bull-green' : 'text-bear-red'}`}>
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isUp ? '+' : ''}
              {quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
            </span>
            <span className="text-dark-text-muted font-normal ml-1">Today</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Chart & Company profile info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Candle/Volume Chart */}
          <div className="rounded-xl bg-dark-card border border-dark-border p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border/45 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Historical Performance</h3>
              
              {/* Timeframe selector filters */}
              <div className="flex bg-dark-bg border border-dark-border rounded-lg p-0.5 select-none text-[10px]">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-md font-bold transition-all ${
                      timeframe === tf 
                        ? 'bg-bull-green/10 text-bull-green' 
                        : 'text-dark-text-muted hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {loadingChart ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-bull-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? '#00c805' : '#ff3b30'} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={isUp ? '#00c805' : '#ff3b30'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8a9fc2" fontSize={10} tickLine={false} axisLine={false} />
                    
                    {/* Primary Y Axis (left) for Stock Price */}
                    <YAxis
                      yAxisId="price"
                      stroke="#8a9fc2"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    
                    {/* Secondary Y Axis (right) for Volume (hidden visually) */}
                    <YAxis
                      yAxisId="volume"
                      orientation="right"
                      stroke="#8a9fc2"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      hide
                    />
                    
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151a26', borderColor: '#222b3e', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    
                    {/* Composed Elements */}
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="Price"
                      name="Stock Price"
                      stroke={isUp ? '#00c805' : '#ff3b30'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                    
                    {/* Volume Bar Overlay, faded in background */}
                    <Bar
                      yAxisId="volume"
                      dataKey="Volume"
                      name="Volume"
                      fill="#374151"
                      opacity={0.15}
                      barSize={12}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Company details stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-dark-card border border-dark-border p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border pb-2 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-bull-green" />
                <span>Asset Summary</span>
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-dark-text-muted">Day High</span>
                  <span className="font-bold text-white">${quote.h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-text-muted">Day Low</span>
                  <span className="font-bold text-white">${quote.l.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-text-muted">Prev Close</span>
                  <span className="font-bold text-white">${quote.pc.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-dark-card border border-dark-border p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border pb-2 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-bull-green" />
                <span>Reference Links</span>
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-dark-text-muted">Ticker</span>
                  <span className="font-bold text-bull-green uppercase">{symbol}</span>
                </div>
                {profile.weburl && (
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-dark-text-muted">Corporate URL</span>
                    <a
                      href={profile.weburl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-bull-green hover:underline max-w-[140px] truncate"
                    >
                      {profile.weburl.replace('https://', '').replace('www.', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Order Panel */}
        <div className="space-y-6">
          {/* Order Executive Form */}
          <div className="rounded-xl bg-dark-card border border-dark-border overflow-hidden">
            <div className="grid grid-cols-2 text-center text-xs font-bold border-b border-dark-border select-none">
              <button
                onClick={() => {
                  setTradeType('BUY');
                  setTradeError(null);
                }}
                className={`py-3.5 transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-bull-green/10 text-bull-green border-b-2 border-bull-green font-extrabold'
                    : 'text-dark-text-muted hover:text-white bg-dark-card-hover/20'
                }`}
              >
                BUY {symbol.toUpperCase()}
              </button>
              <button
                onClick={() => {
                  setTradeType('SELL');
                  setTradeError(null);
                }}
                className={`py-3.5 transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-bear-red/10 text-bear-red border-b-2 border-bear-red font-extrabold'
                    : 'text-dark-text-muted hover:text-white bg-dark-card-hover/20'
                }`}
              >
                SELL {symbol.toUpperCase()}
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-dark-text-muted bg-dark-bg/40 p-2.5 rounded border border-dark-border/40">
                <span>Owned Holdings:</span>
                <span className="font-bold text-white">{ownedShares} shares</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider">Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter share count"
                  value={sharesInput}
                  onChange={(e) => {
                    setSharesInput(e.target.value);
                    setTradeError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-sm text-white placeholder:text-dark-text-muted outline-none focus:border-bull-green/40 focus:ring-1 focus:ring-bull-green/10"
                />
              </div>

              <div className="space-y-3 pt-2 text-xs border-t border-dark-border/40">
                <div className="flex justify-between text-dark-text-muted">
                  <span>Market Price:</span>
                  <span className="font-medium text-white">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-dark-border/30 pt-2 text-sm text-white">
                  <span>Estimated {tradeType === 'BUY' ? 'Cost' : 'Proceeds'}:</span>
                  <span>${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {tradeType === 'BUY' && !canBuy && enteredShares > 0 && (
                <div className="flex gap-2 p-2.5 rounded bg-bear-red/10 border border-bear-red/25 text-[11px] text-bear-red">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Insufficient purchasing power cash balance.</span>
                </div>
              )}
              {tradeType === 'SELL' && !canSell && enteredShares > 0 && (
                <div className="flex gap-2 p-2.5 rounded bg-bear-red/10 border border-bear-red/25 text-[11px] text-bear-red">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Insufficient owned shares in your holdings.</span>
                </div>
              )}
              {tradeError && (
                <div className="p-2.5 rounded bg-bear-red/10 border border-bear-red/25 text-[11px] text-bear-red text-center">
                  {tradeError}
                </div>
              )}

              <button
                type="submit"
                disabled={isExecuting || isFormInvalid}
                className={`w-full font-bold py-3 mt-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  tradeType === 'BUY'
                    ? 'bg-bull-green hover:bg-bull-green/90 disabled:bg-bull-green/40 disabled:text-dark-bg text-dark-bg hover:shadow hover:shadow-bull-green/10'
                    : 'bg-bear-red hover:bg-bear-red/90 disabled:bg-bear-red/40 disabled:text-white text-white hover:shadow hover:shadow-bear-red/10'
                }`}
              >
                {isExecuting ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    <span>Execute {tradeType} Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sandbox Guidelines */}
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-bull-green shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Market Trading Hours</p>
              <p className="text-[10px] text-dark-text-muted leading-relaxed">
                SB Stocks quotes use real-time US exchanges. Order execution balances virtual assets immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Success Overlay Modal */}
      <AnimatePresence>
        {showSuccessModal && executedTradeDetails && (
          <div className="fixed inset-0 bg-dark-bg/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl space-y-6 glow-bull"
            >
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-bull-green/10 flex items-center justify-center text-bull-green mx-auto mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Order Executed Successfully</h3>
                <p className="text-xs text-dark-text-muted">Virtual paper trade logs recorded</p>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl space-y-3.5 text-xs text-white">
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Security:</span>
                  <span className="font-bold">{executedTradeDetails.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Order Action:</span>
                  <span className={`font-bold uppercase ${executedTradeDetails.type === 'BUY' ? 'text-bull-green' : 'text-bear-red'}`}>
                    {executedTradeDetails.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Shares:</span>
                  <span className="font-semibold">{executedTradeDetails.shares} shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Execution Price:</span>
                  <span className="font-semibold">${executedTradeDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-dark-border/40 pt-2 text-sm">
                  <span className="text-dark-text-muted font-normal">Total {executedTradeDetails.type === 'BUY' ? 'Cost' : 'Proceeds'}:</span>
                  <span className="font-bold text-bull-green">${executedTradeDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-bull-green text-dark-bg font-bold py-2.5 rounded-lg hover:bg-bull-green/90 transition-all text-xs"
              >
                Dismiss Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockDetails;
