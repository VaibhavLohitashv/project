import { gql } from '@apollo/client';

export const GET_RECIPES = gql`
  query GetRecipes($category: String, $searchTerm: String) {
    recipes(category: $category, searchTerm: $searchTerm) {
      id
      title
      category
      averageRating
      createdBy {
        id
        username
      }
    }
  }
`;

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      id
      title
      ingredients
      instructions
      category
      averageRating
      createdBy {
        id
        username
      }
      reviews {
        id
        content
        rating
        user {
          id
          username
        }
        createdAt
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      recipes {
        id
        title
        category
        averageRating
        createdBy {
          id
          username
        }
      }
    }
  }
`; 