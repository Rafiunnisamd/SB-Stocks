import express from 'express';
import { getQuote, getProfile, search, getNews, getCandles } from '../controllers/stockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/quote/:symbol', protect, getQuote);
router.get('/profile/:symbol', protect, getProfile);
router.get('/search', protect, search);
router.get('/news', protect, getNews);
router.get('/candles/:symbol', protect, getCandles);

export default router;
