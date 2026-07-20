import express from 'express';
import { executeTrade, getTransactions } from '../controllers/tradeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/execute', protect, executeTrade);
router.get('/transactions', protect, getTransactions);

export default router;
