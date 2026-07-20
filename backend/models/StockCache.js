import mongoose from 'mongoose';

const stockCacheSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // TTL index: MongoDB will automatically delete documents when this time is reached
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const StockCache = mongoose.model('StockCache', stockCacheSchema);

export default StockCache;
