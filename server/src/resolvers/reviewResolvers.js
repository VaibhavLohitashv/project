import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Review from '../models/Review.js';
import Recipe from '../models/Recipe.js';
import { pubsub } from '../index.js';

const REVIEW_ADDED = 'REVIEW_ADDED';

export default {
  Query: {
    // Add review queries if needed
  },
  
  Mutation: {
    createReview: async (_, { recipeId, content, rating }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to submit a review');
      }
      
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new UserInputError('Recipe not found');
      }

      // Check if user has already reviewed this recipe
      const existingReview = await Review.findOne({
        recipe: recipeId,
        user: user.id
      });

      if (existingReview) {
        throw new UserInputError('You have already reviewed this recipe');
      }
      
      const review = new Review({
        content,
        rating,
        recipe: recipeId,
        user: user.id,
      });
      
      await review.save();
      
      // Add review to recipe
      await Recipe.findByIdAndUpdate(recipeId, {
        $push: { reviews: review.id },
      });
      
      // Update recipe average rating
      const reviews = await Review.find({ recipe: recipeId });
      const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      
      await Recipe.findByIdAndUpdate(recipeId, {
        averageRating: Math.round(averageRating * 10) / 10,
      });
      
      const populatedReview = await Review.findById(review.id)
        .populate('user', 'username')
        .populate('recipe');
      
      pubsub.publish(`${REVIEW_ADDED}.${recipeId}`, { 
        reviewAdded: populatedReview,
      });
      
      return populatedReview;
    },
  },
  
  Subscription: {
    reviewAdded: {
      subscribe: (_, { recipeId }) => {
        return pubsub.asyncIterator([`${REVIEW_ADDED}.${recipeId}`]);
      },
    },
  },
}; 