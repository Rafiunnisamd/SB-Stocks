import User from '../models/User.js';
import Holding from '../models/Holding.js';
import Transaction from '../models/Transaction.js';
import { getStockQuote, getStockProfile } from '../services/finnhubService.js';

// @desc    Execute a BUY or SELL trade order
// @route   POST /api/trade/execute
// @access  Private
export const executeTrade = async (req, res, next) => {
  const { symbol, type, shares } = req.body;

  if (!symbol || !type || !shares || shares <= 0) {
    return res.status(400).json({ message: 'Invalid trading inputs. Symbol, type (BUY/SELL), and positive shares quantity are required.' });
  }

  const cleanSymbol = symbol.toUpperCase().trim();
  const tradeType = type.toUpperCase().trim();

  if (tradeType !== 'BUY' && tradeType !== 'SELL') {
    return res.status(400).json({ message: 'Invalid trade type. Action must be BUY or SELL.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch latest market quote
    const quote = await getStockQuote(cleanSymbol);
    const executionPrice = quote.c;
    
    // Fetch profile to get company name (if first-time hold)
    const profile = await getStockProfile(cleanSymbol);
    const companyName = profile.name || cleanSymbol;

    const totalCost = parseFloat((shares * executionPrice).toFixed(2));

    // Handle BUY
    if (tradeType === 'BUY') {
      if (user.balance < totalCost) {
        return res.status(400).json({
          message: `Insufficient funds. Purchase cost is $${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} but your available balance is only $${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
        });
      }

      // Deduct balance
      user.balance = parseFloat((user.balance - totalCost).toFixed(2));
      await user.save();

      // Check if user already holds this stock
      let holding = await Holding.findOne({ userId: user._id, symbol: cleanSymbol });
      if (holding) {
        const oldShares = holding.shares;
        const oldCost = oldShares * holding.avgBuyPrice;
        
        // Recalculate average buy price
        holding.shares += shares;
        holding.avgBuyPrice = parseFloat(((oldCost + totalCost) / holding.shares).toFixed(4));
        await holding.save();
      } else {
        // Create new holding
        await Holding.create({
          userId: user._id,
          symbol: cleanSymbol,
          companyName,
          shares,
          avgBuyPrice: executionPrice
        });
      }
    } 
    
    // Handle SELL
    else if (tradeType === 'SELL') {
      const holding = await Holding.findOne({ userId: user._id, symbol: cleanSymbol });
      
      if (!holding || holding.shares < shares) {
        return res.status(400).json({
          message: `Insufficient shares. You are attempting to sell ${shares} shares of ${cleanSymbol} but you only own ${holding ? holding.shares : 0} shares.`
        });
      }

      // Credit cash balance
      user.balance = parseFloat((user.balance + totalCost).toFixed(2));
      await user.save();

      holding.shares -= shares;
      
      if (holding.shares === 0) {
        // Delete holding entry if fully sold
        await Holding.deleteOne({ _id: holding._id });
      } else {
        await holding.save();
      }
    }

    // Record Transaction log
    const transaction = await Transaction.create({
      userId: user._id,
      symbol: cleanSymbol,
      type: tradeType,
      shares,
      price: executionPrice,
      totalAmount: totalCost
    });

    res.status(200).json({
      message: `Order execution successful. ${tradeType} ${shares} shares of ${cleanSymbol} at $${executionPrice.toFixed(2)}`,
      transaction,
      newBalance: user.balance
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transactions logs history (with pagination & sorting)
// @route   GET /api/trade/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalTransactions = await Transaction.countDocuments({ userId: req.user.id });
    
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      totalTransactions
    });
  } catch (error) {
    next(error);
  }
};
