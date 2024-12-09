import { gql } from '@apollo/client';

export const RECIPE_ADDED_SUBSCRIPTION = gql`
  subscription OnRecipeAdded {
    recipeAdded {
      id
      title
      category
      averageRating
      createdBy {
        username
      }
    }
  }
`;

export const REVIEW_ADDED_SUBSCRIPTION = gql`
  subscription OnReviewAdded($recipeId: ID!) {
    reviewAdded(recipeId: $recipeId) {
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
`; 