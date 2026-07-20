import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    // Daily snapshot of portfolio value (cash + stock value) to draw charts
    history: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        value: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({ userId: 1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
