import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../models/User.js';
import { generateToken, hashPassword, comparePasswords } from '../utils/auth.js';

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return user;
    },
    user: async (_, { id }) => {
      return await User.findById(id);
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