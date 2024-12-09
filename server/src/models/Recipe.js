import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  id: false
});

// Add virtual for id
recipeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Add text index for search functionality
recipeSchema.index({ title: 'text', ingredients: 'text' });

export default mongoose.model('Recipe', recipeSchema); 