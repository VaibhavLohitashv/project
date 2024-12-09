import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RECIPE } from '../graphql/queries';
import { CREATE_REVIEW } from '../graphql/mutations';
import { StarIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');

  const { loading, error: queryError, data, refetch } = useQuery(GET_RECIPE, {
    variables: { id },
  });

  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setReviewContent('');
      setRating(5);
      setError('');
      refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleReviewSubmit = async (e) => {
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
      // Error is handled by onError above
    }
  };

  if (loading) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError.message}</div>;

  const recipe = data.recipe;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          {user && (
            <form onSubmit={handleReviewSubmit} className="mb-6">
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
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {recipe.reviews?.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{review.user.username}</span>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700">{review.content}</p>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 