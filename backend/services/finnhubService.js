import StockCache from '../models/StockCache.js';
import { getStockPrice } from '../utils/stockPriceHelper.js';

// Finnhub API endpoints
const BASE_URL = 'https://finnhub.io/api/v1';

// Cache expiration times (in seconds)
const CACHE_EXPIRY = {
  QUOTE: 60,         // 1 minute
  PROFILE: 86400 * 7, // 7 days
  SEARCH: 86400,     // 1 day
  NEWS: 900,         // 15 minutes
};

// Check if Cache exists
const getFromCache = async (key) => {
  try {
    const cached = await StockCache.findOne({ key });
    if (cached && cached.expiresAt > new Date()) {
      return cached.value;
    }
    return null;
  } catch (error) {
    console.error(`Cache read error: ${error.message}`);
    return null;
  }
};

// Save to Cache helper
const saveToCache = async (key, value, durationInSeconds) => {
  try {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + durationInSeconds);
    await StockCache.findOneAndUpdate(
      { key },
      { value, expiresAt },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error(`Cache write error: ${error.message}`);
  }
};

// Simulated Fallbacks if Finnhub Key is missing or rate limited
const getMockQuote = async (symbol) => {
  const current = await getStockPrice(symbol);
  const prevClose = parseFloat((current * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2));
  const change = parseFloat((current - prevClose).toFixed(2));
  const percentChange = parseFloat(((change / prevClose) * 100).toFixed(2));
  
  return {
    c: current,
    h: parseFloat((Math.max(current, prevClose) * 1.01).toFixed(2)),
    l: parseFloat((Math.min(current, prevClose) * 0.99).toFixed(2)),
    o: parseFloat(((current + prevClose) / 2).toFixed(2)),
    pc: prevClose,
    d: change,
    dp: percentChange,
  };
};

const getMockProfile = (symbol) => {
  const names = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    TSLA: 'Tesla Inc.',
    NVDA: 'NVIDIA Corporation',
    META: 'Meta Platforms Inc.',
    NFLX: 'Netflix Inc.',
    AMD: 'Advanced Micro Devices Inc.',
    BABA: 'Alibaba Group Holding Ltd',
  };
  
  return {
    name: names[symbol.toUpperCase()] || `${symbol.toUpperCase()} Corp`,
    ticker: symbol.toUpperCase(),
    logo: `https://financialmodelingprep.com/image-placeholder/${symbol.toUpperCase()}.png`,
    weburl: `https://www.google.com/finance/quote/${symbol.toUpperCase()}:NASDAQ`,
    finnhubIndustry: 'Technology',
    shareOutstanding: 1000,
  };
};

const getMockSearch = (query) => {
  const list = [
    { symbol: 'AAPL', description: 'APPLE INC' },
    { symbol: 'MSFT', description: 'MICROSOFT CORP' },
    { symbol: 'GOOGL', description: 'ALPHABET INC-CL A' },
    { symbol: 'AMZN', description: 'AMAZON.COM INC' },
    { symbol: 'TSLA', description: 'TESLA INC' },
    { symbol: 'NVDA', description: 'NVIDIA CORP' },
    { symbol: 'META', description: 'META PLATFORMS INC' },
    { symbol: 'NFLX', description: 'NETFLIX INC' },
    { symbol: 'AMD', description: 'ADVANCED MICRO DEVICES' },
    { symbol: 'BABA', description: 'ALIBABA GROUP HOLDING' },
  ];
  
  return list.filter(
    item =>
      item.symbol.includes(query.toUpperCase()) ||
      item.description.includes(query.toUpperCase())
  );
};

// Finnhub fetch helper
const fetchFromFinnhub = async (path, params = {}) => {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    throw new Error('API_KEY_MISSING');
  }

  const queryParams = new URLSearchParams({ ...params, token });
  const url = `${BASE_URL}${path}?${queryParams.toString()}`;
  
  const response = await fetch(url);
  if (response.status === 429) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  if (!response.ok) {
    throw new Error(`FINNHUB_API_ERROR: ${response.statusText}`);
  }
  
  return await response.json();
};

// Main Exported Services
export const getStockQuote = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase();
  const cacheKey = `quote_${cleanSymbol}`;
  
  // Try Cache
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromFinnhub('/quote', { symbol: cleanSymbol });
    // Finnhub quote returns empty if invalid symbol. Verify.
    if (!data.c) {
      throw new Error('INVALID_SYMBOL');
    }
    await saveToCache(cacheKey, data, CACHE_EXPIRY.QUOTE);
    return data;
  } catch (error) {
    console.warn(`Finnhub quote fetch failed: ${error.message}. Returning mock data.`);
    const mock = await getMockQuote(cleanSymbol);
    await saveToCache(cacheKey, mock, CACHE_EXPIRY.QUOTE);
    return mock;
  }
};

export const getStockProfile = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase();
  const cacheKey = `profile_${cleanSymbol}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromFinnhub('/stock/profile2', { symbol: cleanSymbol });
    if (!data.name) {
      throw new Error('INVALID_SYMBOL');
    }
    await saveToCache(cacheKey, data, CACHE_EXPIRY.PROFILE);
    return data;
  } catch (error) {
    console.warn(`Finnhub profile fetch failed: ${error.message}. Returning mock data.`);
    const mock = getMockProfile(cleanSymbol);
    await saveToCache(cacheKey, mock, CACHE_EXPIRY.PROFILE);
    return mock;
  }
};

export const searchStocks = async (query) => {
  if (!query || query.trim() === '') return [];
  const cleanQuery = query.trim().toUpperCase();
  const cacheKey = `search_${cleanQuery}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromFinnhub('/search', { q: cleanQuery });
    const results = data.result || [];
    
    // Filter to US stock symbols only to keep it clean
    const formatted = results
      .filter(item => item.type === 'Common Stock' && !item.symbol.includes('.'))
      .map(item => ({
        symbol: item.symbol,
        description: item.description,
      }));

    await saveToCache(cacheKey, formatted, CACHE_EXPIRY.SEARCH);
    return formatted;
  } catch (error) {
    console.warn(`Finnhub search fetch failed: ${error.message}. Returning mock results.`);
    const mock = getMockSearch(cleanQuery);
    await saveToCache(cacheKey, mock, CACHE_EXPIRY.SEARCH);
    return mock;
  }
};

export const getMarketNews = async () => {
  const cacheKey = 'market_news';

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromFinnhub('/news', { category: 'general' });
    const formatted = data.slice(0, 10).map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      time: new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: item.url,
      image: item.image,
    }));
    await saveToCache(cacheKey, formatted, CACHE_EXPIRY.NEWS);
    return formatted;
  } catch (error) {
    console.warn(`Finnhub news fetch failed: ${error.message}. Returning empty list.`);
    return [];
  }
};

const generateMockCandles = (symbol, resolution, from, to) => {
  const data = { o: [], h: [], l: [], c: [], v: [], t: [], s: 'ok' };
  const fromDate = new Date(from * 1000);
  const toDate = new Date(to * 1000);
  const daysDiff = Math.max(1, Math.round((toDate - fromDate) / (86400 * 1000)));

  let currentPrice = 150.00;
  const staticPrices = { AAPL: 182.52, MSFT: 415.60, TSLA: 171.05, NVDA: 875.12, GOOGL: 151.77 };
  const cleanSymbol = symbol.toUpperCase();
  if (staticPrices[cleanSymbol]) {
    currentPrice = staticPrices[cleanSymbol];
  }

  let price = currentPrice - (daysDiff * (Math.random() - 0.45) * (currentPrice * 0.005));

  for (let i = 0; i < daysDiff; i++) {
    const timestamp = from + (i * 86400);
    const openPrice = price;
    const closePrice = price + (Math.random() - 0.47) * (price * 0.025);
    const highPrice = Math.max(openPrice, closePrice) + (Math.random() * (price * 0.01));
    const lowPrice = Math.min(openPrice, closePrice) - (Math.random() * (price * 0.01));
    const volume = Math.round(100000 + (Math.random() * 900000));

    data.o.push(parseFloat(openPrice.toFixed(2)));
    data.h.push(parseFloat(highPrice.toFixed(2)));
    data.l.push(parseFloat(lowPrice.toFixed(2)));
    data.c.push(parseFloat(closePrice.toFixed(2)));
    data.v.push(volume);
    data.t.push(timestamp);

    price = closePrice;
  }

  return data;
};

export const getStockCandles = async (symbol, resolution, from, to) => {
  const cleanSymbol = symbol.toUpperCase();
  const cacheKey = `candles_${cleanSymbol}_${resolution}_${from}_${to}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchFromFinnhub('/stock/candle', {
      symbol: cleanSymbol,
      resolution,
      from,
      to,
    });

    if (data.s !== 'ok') {
      throw new Error(`Finnhub candle status: ${data.s}`);
    }

    // Cache historical candles for 1 hour
    await saveToCache(cacheKey, data, 3600);
    return data;
  } catch (error) {
    console.warn(`Finnhub candles fetch failed for ${cleanSymbol}: ${error.message}. Returning mock candles.`);
    const mock = generateMockCandles(cleanSymbol, resolution, from, to);
    await saveToCache(cacheKey, mock, 3600);
    return mock;
  }
};
