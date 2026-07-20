import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    shares: {
      type: Number,
      required: true,
      min: [0.001, 'Shares must be greater than 0'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Execution price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true, // shares * price
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast transactions querying
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ symbol: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
