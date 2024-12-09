import userResolvers from './userResolvers.js';
import recipeResolvers from './recipeResolvers.js';
import reviewResolvers from './reviewResolvers.js';

export default {
  Query: {
    ...userResolvers.Query,
    ...recipeResolvers.Query,
    ...reviewResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...recipeResolvers.Mutation,
    ...reviewResolvers.Mutation,
  },
  Subscription: {
    ...recipeResolvers.Subscription,
    ...reviewResolvers.Subscription,
  },
}; 