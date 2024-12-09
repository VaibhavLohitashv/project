import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../models/User.js';
import { generateToken, hashPassword, comparePasswords } from '../utils/auth.js';

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      try {
        const populatedUser = await User.findById(user._id)
          .populate({
            path: 'recipes',
            populate: {
              path: 'createdBy',
              select: 'username'
            }
          })
          .populate({
            path: 'savedRecipes',
            populate: {
              path: 'createdBy',
              select: 'username'
            }
          });

        if (!populatedUser) {
          throw new Error('User not found');
        }

        return populatedUser;
      } catch (error) {
        console.error('Error in me query:', error);
        throw new Error('Error fetching user data');
      }
    },
    user: async (_, { id }) => {
      try {
        const user = await User.findById(id)
          .populate({
            path: 'recipes',
            populate: {
              path: 'createdBy',
              select: 'username'
            }
          })
          .populate({
            path: 'savedRecipes',
            populate: {
              path: 'createdBy',
              select: 'username'
            }
          });

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        console.error('Error in user query:', error);
        throw new Error('Error fetching user data');
      }
    },
  },
  
  Mutation: {
    signup: async (_, { username, email, password }) => {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        throw new UserInputError('User already exists');
      }

      const hashedPassword = await hashPassword(password);
      
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
      
      await user.save();
      
      const token = generateToken(user);
      
      return { token, user };
    },
    
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new UserInputError('Invalid credentials');
      }
      
      const validPassword = await comparePasswords(password, user.password);
      
      if (!validPassword) {
        throw new UserInputError('Invalid credentials');
      }
      
      const token = generateToken(user);
      
      return { token, user };
    },
  },
}; 