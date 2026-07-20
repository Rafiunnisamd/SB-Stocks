import User from '../models/User.js';
import Holding from '../models/Holding.js';
import Watchlist from '../models/Watchlist.js';
import Portfolio from '../models/Portfolio.js';
import { getStockQuote } from '../services/finnhubService.js';

// Helper to generate mock portfolio history if empty
const checkAndGenerateHistory = async (userId, currentTotalValue) => {
  let portfolio = await Portfolio.findOne({ userId });
  
  if (!portfolio) {
    portfolio = new Portfolio({ userId, totalInvested: 0, history: [] });
  }

  // If history is empty or short, seed it with 30 days of mock growth data
  if (portfolio.history.length === 0) {
    const historyData = [];
    const baseValue = 100000.00; // Starting virtual cash
    const now = new Date();
    
    for (let i = 30; i >= 1; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Simulate historical fluctuations trending upwards/downwards based on simple sine/noise
      const multiplier = 1 + (Math.sin(i / 5) * 0.02) + (Math.random() - 0.5) * 0.01;
      const simulatedValue = baseValue * multiplier;
      
      historyData.push({
        date,
        value: parseFloat(simulatedValue.toFixed(2)),
      });
    }
    
    // Add today's current actual value
    historyData.push({
      date: now,
      value: parseFloat(currentTotalValue.toFixed(2)),
    });
    
    portfolio.history = historyData;
    await portfolio.save();
  } else {
    // Check if the last entry is from today, if not append today's entry
    const lastEntry = portfolio.history[portfolio.history.length - 1];
    const today = new Date().toDateString();
    const lastEntryDate = new Date(lastEntry.date).toDateString();
    
    if (today !== lastEntryDate) {
      portfolio.history.push({
        date: new Date(),
        value: parseFloat(currentTotalValue.toFixed(2)),
      });
      // Keep only last 90 entries to keep it optimized
      if (portfolio.history.length > 90) {
        portfolio.history.shift();
      }
      await portfolio.save();
    } else {
      // Update today's value with the latest
      lastEntry.value = parseFloat(currentTotalValue.toFixed(2));
      await portfolio.save();
    }
  }
  
  return portfolio.history;
};

// @desc    Get dashboard summary statistics and preview data
// @route   GET /api/portfolio/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch user holdings
    const holdings = await Holding.find({ userId: req.user.id });
    
    let totalStockValue = 0;
    let totalInvestedValue = 0;
    const formattedHoldings = [];

    // Calculate current values of holdings using mock/live prices
    for (const holding of holdings) {
      const quote = await getStockQuote(holding.symbol);
      const currentPrice = quote.c;
      const currentValue = holding.shares * currentPrice;
      const totalCost = holding.shares * holding.avgBuyPrice;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      totalStockValue += currentValue;
      totalInvestedValue += totalCost;

      formattedHoldings.push({
        id: holding._id,
        symbol: holding.symbol,
        companyName: holding.companyName,
        shares: holding.shares,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      });
    }

    const portfolioValue = user.balance + totalStockValue;
    const totalProfitLoss = portfolioValue - 100000.00; // Profit relative to initial $100k
    const totalProfitLossPercent = (totalProfitLoss / 100000.00) * 100;

    // Retrieve watchlist
    const watchlist = await Watchlist.findOne({ userId: req.user.id });
    const watchlistSymbols = watchlist ? watchlist.symbols : [];

    // Retrieve portfolio value history
    const history = await checkAndGenerateHistory(req.user.id, portfolioValue);

    // Calculate Today's Profit/Loss (simulated based on latest market wiggle)
    // We can simulate today's profit/loss as a slight variation of the stock value
    const todayChangePercent = (Math.random() - 0.45) * 2; // -0.9% to +1.1% wiggled daily change
    const todayProfitLoss = (totalStockValue * (todayChangePercent / 100));

    res.status(200).json({
      cashBalance: user.balance,
      totalStockValue: parseFloat(totalStockValue.toFixed(2)),
      portfolioValue: parseFloat(portfolioValue.toFixed(2)),
      totalInvested: parseFloat(totalInvestedValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
      todayProfitLoss: parseFloat(todayProfitLoss.toFixed(2)),
      todayProfitLossPercent: parseFloat(todayChangePercent.toFixed(2)),
      holdings: formattedHoldings.slice(0, 5), // return top 5 holdings for dashboard preview
      watchlistSymbols,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed holdings list and allocations
// @route   GET /api/portfolio/holdings
// @access  Private
export const getHoldingsData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const holdings = await Holding.find({ userId: req.user.id });

    let totalStockValue = 0;
    const holdingsWithPrices = [];

    for (const holding of holdings) {
      const quote = await getStockQuote(holding.symbol);
      const currentPrice = quote.c;
      const currentValue = holding.shares * currentPrice;
      totalStockValue += currentValue;

      holdingsWithPrices.push({
        id: holding._id,
        symbol: holding.symbol,
        companyName: holding.companyName,
        shares: holding.shares,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        currentValue,
      });
    }

    const portfolioValue = user.balance + totalStockValue;

    // Calculate allocations percentage
    const finalHoldings = holdingsWithPrices.map(h => {
      const totalCost = h.shares * h.avgBuyPrice;
      const profitLoss = h.currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
      const allocation = portfolioValue > 0 ? (h.currentValue / portfolioValue) * 100 : 0;

      return {
        ...h,
        currentValue: parseFloat(h.currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
        allocation: parseFloat(allocation.toFixed(2)),
      };
    });

    res.status(200).json({
      cashBalance: user.balance,
      totalStockValue: parseFloat(totalStockValue.toFixed(2)),
      portfolioValue: parseFloat(portfolioValue.toFixed(2)),
      holdings: finalHoldings,
    });
  } catch (error) {
    next(error);
  }
};
