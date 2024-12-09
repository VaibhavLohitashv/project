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

    deleteReview: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a review');
      }

      const review = await Review.findById(id);
      if (!review) {
        throw new UserInputError('Review not found');
      }

      if (review.user.toString() !== user.id) {
        throw new AuthenticationError('Not authorized to delete this review');
      }

      // Remove review from recipe
      await Recipe.findByIdAndUpdate(review.recipe, {
        $pull: { reviews: id }
      });

      // Delete the review
      await Review.findByIdAndDelete(id);

      // Update recipe average rating
      const remainingReviews = await Review.find({ recipe: review.recipe });
      const averageRating = remainingReviews.length > 0
        ? remainingReviews.reduce((acc, curr) => acc + curr.rating, 0) / remainingReviews.length
        : 0;

      await Recipe.findByIdAndUpdate(review.recipe, {
        averageRating: Math.round(averageRating * 10) / 10
      });

      return true;
    },

    updateReview: async (_, { id, content, rating }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update a review');
      }

      const review = await Review.findById(id);
      if (!review) {
        throw new UserInputError('Review not found');
      }

      if (review.user.toString() !== user.id) {
        throw new AuthenticationError('Not authorized to update this review');
      }

      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { content, rating },
        { new: true }
      ).populate('user');

      // Update recipe average rating
      const reviews = await Review.find({ recipe: review.recipe });
      const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

      await Recipe.findByIdAndUpdate(review.recipe, {
        averageRating: Math.round(averageRating * 10) / 10
      });

      return updatedReview;
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