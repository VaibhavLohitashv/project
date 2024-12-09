import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    recipes: [Recipe!]
    savedRecipes: [Recipe!]
    role: String!
  }

  type Recipe {
    id: ID!
    title: String!
    ingredients: [String!]!
    instructions: String!
    category: String!
    createdBy: User!
    reviews: [Review!]
    averageRating: Float
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: ID!
    content: String!
    rating: Int!
    recipe: Recipe!
    user: User!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    recipes(
      category: String
      searchTerm: String
      skip: Int
      limit: Int
    ): [Recipe!]!
    recipe(id: ID!): Recipe
    user(id: ID!): User
    me: User
  }

  type Mutation {
    signup(
      username: String!
      email: String!
      password: String!
    ): AuthPayload!
    
    login(
      email: String!
      password: String!
    ): AuthPayload!
    
    createRecipe(
      title: String!
      ingredients: [String!]!
      instructions: String!
      category: String!
    ): Recipe!
    
    updateRecipe(
      id: ID!
      title: String
      ingredients: [String]
      instructions: String
      category: String
    ): Recipe!
    
    deleteRecipe(id: ID!): Boolean!
    
    createReview(
      recipeId: ID!
      content: String!
      rating: Int!
    ): Review!
    
    saveRecipe(recipeId: ID!): User!
    unsaveRecipe(recipeId: ID!): User!
    deleteReview(id: ID!): Boolean!
    
    updateReview(
      id: ID!
      content: String!
      rating: Int!
    ): Review!
  }

  type Subscription {
    recipeAdded: Recipe!
    reviewAdded(recipeId: ID!): Review!
  }
`;

export default typeDefs; 