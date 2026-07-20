import {
  getStockQuote,
  getStockProfile,
  searchStocks,
  getMarketNews,
  getStockCandles
} from '../services/finnhubService.js';

// @desc    Get real-time quote for a stock symbol
// @route   GET /api/stocks/quote/:symbol
// @access  Private
export const getQuote = async (req, res, next) => {
  const { symbol } = req.params;
  try {
    const data = await getStockQuote(symbol);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile details for a company symbol
// @route   GET /api/stocks/profile/:symbol
// @access  Private
export const getProfile = async (req, res, next) => {
  const { symbol } = req.params;
  try {
    const data = await getStockProfile(symbol);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Search matching stock symbols
// @route   GET /api/stocks/search
// @access  Private
export const search = async (req, res, next) => {
  const { q } = req.query;
  try {
    const data = await searchStocks(q);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Get global market news
// @route   GET /api/stocks/news
// @access  Private
export const getNews = async (req, res, next) => {
  try {
    const data = await getMarketNews();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock historical candlestick data
// @route   GET /api/stocks/candles/:symbol
// @access  Private
export const getCandles = async (req, res, next) => {
  const { symbol } = req.params;
  const resolution = req.query.resolution || 'D';
  const to = parseInt(req.query.to) || Math.floor(Date.now() / 1000);
  const from = parseInt(req.query.from) || to - (86400 * 30); // Default to last 30 days

  try {
    const data = await getStockCandles(symbol, resolution, from, to);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
