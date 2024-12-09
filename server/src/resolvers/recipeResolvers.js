import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { pubsub } from '../index.js';

const RECIPE_ADDED = 'RECIPE_ADDED';

export default {
  Query: {
    recipes: async (_, { category, searchTerm, skip = 0, limit = 10 }) => {
      const query = {};
      
      if (category) {
        query.category = category;
      }
      
      if (searchTerm) {
        query.$text = { $search: searchTerm };
      }
      
      const recipes = await Recipe.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'createdBy',
          select: 'username email'
        })
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'username'
          }
        });

      return recipes;
    },
    
    recipe: async (_, { id }) => {
      const recipe = await Recipe.findById(id)
        .populate({
          path: 'createdBy',
          select: 'username email'
        })
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'username'
          }
        });

      if (!recipe) {
        throw new UserInputError('Recipe not found');
      }

      return recipe;
    },
  },
  
  Mutation: {
    createRecipe: async (_, { title, ingredients, instructions, category }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const recipe = new Recipe({
        title,
        ingredients,
        instructions,
        category,
        createdBy: user.id,
      });
      
      await recipe.save();
      
      // Add recipe to user's recipes
      await User.findByIdAndUpdate(user.id, {
        $push: { recipes: recipe.id },
      });
      
      const populatedRecipe = await Recipe.findById(recipe.id)
        .populate('createdBy');
      
      pubsub.publish(RECIPE_ADDED, { recipeAdded: populatedRecipe });
      
      return populatedRecipe;
    },
    
    updateRecipe: async (_, { id, ...updates }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const recipe = await Recipe.findById(id);
      
      if (!recipe) throw new UserInputError('Recipe not found');
      
      if (recipe.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
        throw new AuthenticationError('Not authorized');
      }
      
      return await Recipe.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).populate('createdBy');
    },
    
    deleteRecipe: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const recipe = await Recipe.findById(id);
      
      if (!recipe) throw new UserInputError('Recipe not found');
      
      if (recipe.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
        throw new AuthenticationError('Not authorized');
      }
      
      await Recipe.findByIdAndDelete(id);
      
      // Remove recipe from user's recipes
      await User.findByIdAndUpdate(user.id, {
        $pull: { recipes: id },
      });
      
      return true;
    },
  },
  
  Subscription: {
    recipeAdded: {
      subscribe: () => pubsub.asyncIterator([RECIPE_ADDED]),
    },
  },
}; 