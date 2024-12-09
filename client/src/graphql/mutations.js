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