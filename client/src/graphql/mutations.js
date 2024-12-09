import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const SIGNUP = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const CREATE_RECIPE = gql`
  mutation CreateRecipe($title: String!, $ingredients: [String!]!, $instructions: String!, $category: String!) {
    createRecipe(title: $title, ingredients: $ingredients, instructions: $instructions, category: $category) {
      id
      title
      ingredients
      instructions
      category
      createdBy {
        username
      }
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($recipeId: ID!, $content: String!, $rating: Int!) {
    createReview(recipeId: $recipeId, content: $content, rating: $rating) {
      id
      content
      rating
      user {
        username
      }
      createdAt
    }
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe(
    $id: ID!
    $title: String
    $ingredients: [String]
    $instructions: String
    $category: String
  ) {
    updateRecipe(
      id: $id
      title: $title
      ingredients: $ingredients
      instructions: $instructions
      category: $category
    ) {
      id
      title
      ingredients
      instructions
      category
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $content: String!, $rating: Int!) {
    updateReview(id: $id, content: $content, rating: $rating) {
      id
      content
      rating
    }
  }
`; 