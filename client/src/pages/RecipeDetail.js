import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RECIPE } from '../graphql/queries';
import { CREATE_REVIEW, DELETE_RECIPE, UPDATE_RECIPE, DELETE_REVIEW, UPDATE_REVIEW } from '../graphql/mutations';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../context/AuthContext';
import { REVIEW_ADDED_SUBSCRIPTION } from '../graphql/subscriptions';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState(null);

  const { loading, error: queryError, data, refetch, subscribeToMore } = useQuery(GET_RECIPE, {
    variables: { id },
  });

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: REVIEW_ADDED_SUBSCRIPTION,
      variables: { recipeId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newReview = subscriptionData.data.reviewAdded;

        return {
          recipe: {
            ...prev.recipe,
            reviews: [...prev.recipe.reviews, newReview]
          }
        };
      }
    });

    return () => unsubscribe();
  }, [subscribeToMore, id]);

  const [createReview, { loading: createReviewLoading }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setReviewContent('');
      setRating(5);
      refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [deleteRecipe] = useMutation(DELETE_RECIPE, {
    onCompleted: () => {
      navigate('/');
    },
  });

  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    onCompleted: () => {
      setIsEditing(false);
      refetch();
    },
  });

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    onCompleted: () => {
      refetch();
    },
  });

  const [updateReview, { loading: updateReviewLoading }] = useMutation(UPDATE_REVIEW, {
    onCompleted: () => {
      setEditingReview(null);
      refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        variables: {
          recipeId: id,
          content: reviewContent,
          rating: parseInt(rating),
        },
      });
    } catch (err) {
      // Error handled by onError above
    }
  };

  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe({ variables: { id } });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    try {
      await updateRecipe({
        variables: {
          id,
          ...editedRecipe,
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview({ variables: { id: reviewId } });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      await updateReview({
        variables: {
          id: editingReview.id,
          content: editingReview.content,
          rating: parseInt(editingReview.rating),
        },
      });
    } catch (err) {
      // Error handled by onError above
    }
  };

  if (loading) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError.message}</div>;

  const recipe = data.recipe;
  const isOwner = user && recipe.createdBy.id === user.id;

  return (
    <div className="max-w-4xl mx-auto">
      {isEditing ? (
        // Recipe Edit Form
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Edit Recipe</h2>
          <form onSubmit={handleUpdateRecipe} className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="input-field"
                value={editedRecipe.title}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Ingredients</label>
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    className="input-field"
                    value={ingredient}
                    onChange={(e) => {
                      const newIngredients = [...editedRecipe.ingredients];
                      newIngredients[index] = e.target.value;
                      setEditedRecipe({
                        ...editedRecipe,
                        ingredients: newIngredients,
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newIngredients = editedRecipe.ingredients.filter(
                        (_, i) => i !== index
                      );
                      setEditedRecipe({
                        ...editedRecipe,
                        ingredients: newIngredients,
                      });
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setEditedRecipe({
                    ...editedRecipe,
                    ingredients: [...editedRecipe.ingredients, ''],
                  })
                }
                className="text-blue-600 hover:text-blue-700"
              >
                + Add Ingredient
              </button>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Instructions</label>
              <textarea
                className="input-field"
                rows="4"
                value={editedRecipe.instructions}
                onChange={(e) =>
                  setEditedRecipe({
                    ...editedRecipe,
                    instructions: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select
                className="input-field"
                value={editedRecipe.category}
                onChange={(e) =>
                  setEditedRecipe({
                    ...editedRecipe,
                    category: e.target.value,
                  })
                }
                required
              >
                {[
                  'Breakfast',
                  'Lunch',
                  'Dinner',
                  'Dessert',
                  'Vegan',
                  'Vegetarian',
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Recipe Display
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedRecipe(recipe);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDeleteRecipe}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">By {recipe.createdBy.username}</span>
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1">
                {recipe.averageRating?.toFixed(1) || 'No ratings'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Instructions</h2>
            <p className="text-gray-700 whitespace-pre-line">{recipe.instructions}</p>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        {/* Add Review Form */}
        {user && (
          <form onSubmit={handleSubmitReview} className="mb-8">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Review</label>
              <textarea
                className="input-field"
                rows="3"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <select
                className="input-field"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
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
              className="btn-primary"
              disabled={createReviewLoading}
            >
              {createReviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {recipe.reviews?.map((review) => (
            <div key={review.id} className="border-b pb-4">
              {editingReview?.id === review.id ? (
                <form onSubmit={handleUpdateReview} className="space-y-4">
                  <textarea
                    value={editingReview.content}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, content: e.target.value })
                    }
                    className="input-field"
                    rows="3"
                    required
                  />
                  <select
                    value={editingReview.rating}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, rating: e.target.value })
                    }
                    className="input-field"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} Stars
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={updateReviewLoading}
                    >
                      {updateReviewLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{review.user.username}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1">{review.rating}</span>
                      </div>
                      {user && review.user.id === user.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingReview(review)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 