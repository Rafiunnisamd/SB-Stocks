import express from 'express';
import { getDashboardData, getHoldingsData } from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/holdings', protect, getHoldingsData);

export default router;
