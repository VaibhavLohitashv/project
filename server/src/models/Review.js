import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  id: false
});

// Add virtual for id
reviewSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Review', reviewSchema); 