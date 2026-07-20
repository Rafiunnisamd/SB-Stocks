import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: true,
    },
    shares: {
      type: Number,
      required: true,
      min: [0, 'Shares cannot be negative'],
      default: 0,
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: [0, 'Average buy price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: A user can only have one holding entry per stock symbol
holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });
holdingSchema.index({ userId: 1 });

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;
