import Watchlist from '../models/Watchlist.js';
import { getStockQuote, getStockProfile } from '../services/finnhubService.js';

// @desc    Get user's watchlist with stock quotes
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: req.user.id, symbols: [] });
    }

    const items = [];
    for (const symbol of watchlist.symbols) {
      try {
        const quote = await getStockQuote(symbol);
        const profile = await getStockProfile(symbol);
        items.push({
          symbol,
          companyName: profile.name || symbol,
          logo: profile.logo,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
        });
      } catch (err) {
        console.warn(`Watchlist quote fail for ${symbol}: ${err.message}`);
      }
    }

    res.status(200).json({ symbols: watchlist.symbols, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add symbol to user's watchlist
// @route   POST /api/watchlist/add
// @access  Private
export const addToWatchlist = async (req, res, next) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required' });
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user.id, symbols: [] });
    }

    if (watchlist.symbols.includes(cleanSymbol)) {
      return res.status(400).json({ message: 'Symbol is already in watchlist' });
    }

    watchlist.symbols.push(cleanSymbol);
    await watchlist.save();

    res.status(200).json({ message: 'Symbol added to watchlist', symbols: watchlist.symbols });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove symbol from user's watchlist
// @route   POST /api/watchlist/remove
// @access  Private
export const removeFromWatchlist = async (req, res, next) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required' });
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  try {
    const watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist || !watchlist.symbols.includes(cleanSymbol)) {
      return res.status(404).json({ message: 'Symbol not found in watchlist' });
    }

    watchlist.symbols = watchlist.symbols.filter((s) => s !== cleanSymbol);
    await watchlist.save();

    res.status(200).json({ message: 'Symbol removed from watchlist', symbols: watchlist.symbols });
  } catch (error) {
    next(error);
  }
};
