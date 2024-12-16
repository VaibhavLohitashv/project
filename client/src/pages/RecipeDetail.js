import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RECIPE } from '../graphql/queries';
import { CREATE_REVIEW, UPDATE_RECIPE, DELETE_RECIPE, DELETE_REVIEW } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { RECIPE_CATEGORIES } from '../utils/constants';

const StarIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 inline-block" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Add a helper function for date formatting
const formatDate = (dateString) => {
  try {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Date unavailable';
  }
};

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    ingredients: [],
    instructions: '',
    category: ''
  });

  const { loading, error, data, refetch } = useQuery(GET_RECIPE, {
    variables: { id },
  });

  const [createReview] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setReviewContent('');
      setRating(5);
      refetch();
    }
  });

  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    onCompleted: () => {
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      console.error('Update Recipe Error:', error);
      alert('Failed to update recipe');
    }
  });

  const [deleteRecipe] = useMutation(DELETE_RECIPE, {
    onCompleted: () => {
      navigate('/');
    },
    onError: (error) => {
      console.error('Delete Recipe Error:', error);
      alert('Failed to delete recipe: ' + error.message);
    },
    update(cache) {
      // Remove the recipe from Apollo cache
      cache.evict({ id: `Recipe:${id}` });
      cache.gc();
    }
  });

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Delete Review Error:', error);
      alert('Failed to delete review');
    }
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe({
          variables: { id }
        });
      } catch (error) {
        // Error is handled in onError callback
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview({
          variables: { id: reviewId }
        });
      } catch (error) {
        // Error handled in onError callback
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <div className="loading-spinner" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <div className="error-message">{error.message}</div>
    </div>
  );

  const { recipe } = data;
  const isOwner = user?.id === recipe.createdBy?.id;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    createReview({
      variables: {
        recipeId: id,
        content: reviewContent,
        rating: parseInt(rating)
      }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRecipe({
        variables: {
          id,
          ...editForm
        }
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const startEditing = () => {
    setEditForm({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category
    });
    setIsEditing(true);
  };

  return (
    <div className="page-layout">
      <div className="recipe-details-container">
        {/* Header Section - More compact */}
        <div className="recipe-details-header">
          <div className="flex justify-between items-start mb-2">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="w-full space-y-4">
                <div>
                  <label className="text-gray-300 block mb-1">Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Category</label>
                  <select
                    className="select-field"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                  >
                    {RECIPE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Ingredients</label>
                  {editForm.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        className="input-field"
                        value={ingredient}
                        onChange={(e) => {
                          const newIngredients = [...editForm.ingredients];
                          newIngredients[index] = e.target.value;
                          setEditForm({ ...editForm, ingredients: newIngredients });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newIngredients = editForm.ingredients.filter((_, i) => i !== index);
                          setEditForm({ ...editForm, ingredients: newIngredients });
                        }}
                        className="ml-2 text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditForm({
                      ...editForm,
                      ingredients: [...editForm.ingredients, '']
                    })}
                    className="text-red-400"
                  >
                    Add Ingredient
                  </button>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Instructions</label>
                  <textarea
                    className="input-field"
                    value={editForm.instructions}
                    onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                    rows="4"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-primary bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="recipe-details-title">{recipe.title}</h1>
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={startEditing}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit Recipe"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Delete Recipe"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="recipe-details-meta">
            <span className="text-sm">By {recipe.createdBy?.username || 'Unknown'}</span>
            <div className="recipe-rating">
              {recipe.averageRating ? (
                <div className="text-yellow-500 flex items-center text-sm">
                  <span className="mr-1">{recipe.averageRating.toFixed(1)}</span>
                  <StarIcon />
                </div>
              ) : (
                <span className="text-sm">No ratings yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients Section - More compact */}
        <div className="recipe-details-section">
          <h2 className="recipe-details-subtitle">Ingredients</h2>
          <ul className="recipe-ingredients-list text-sm">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm">{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* Instructions Section - More compact */}
        <div className="recipe-details-section">
          <h2 className="recipe-details-subtitle">Instructions</h2>
          <div className="recipe-instructions text-sm">
            {recipe.instructions}
          </div>
        </div>

        {/* Reviews Section - More compact */}
        <div className="recipe-reviews-section">
          <h2 className="recipe-details-subtitle">Reviews</h2>
          
          {/* Add Review Form - More compact */}
          <div className="mb-4">
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-gray-300 block mb-1 text-sm">Write a Review</label>
                <textarea
                  className="input-field text-sm"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share your thoughts about this recipe..."
                  rows="2"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-28">
                  <label className="text-gray-300 block mb-1 text-sm">Rating</label>
                  <select
                    className="select-field text-sm"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    required
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Star' : 'Stars'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary text-sm h-9 mt-6"
                >
                  Add Review
                </button>
              </div>
            </form>
          </div>

          {/* Reviews List - More compact */}
          {recipe.reviews?.length ? (
            <div className="space-y-3">
              {recipe.reviews.map((review) => (
                <div key={review.id} className="recipe-review-item">
                  <div className="review-header">
                    <span className="review-author text-sm">
                      {review.user.username}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="review-rating text-sm">
                        <span className="mr-1">{review.rating}</span>
                        <StarIcon />
                      </div>
                      {user?.id === review.user.id && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="Delete review"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="review-content text-sm">{review.content}</p>
                  <span className="review-date text-xs">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 