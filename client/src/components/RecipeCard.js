import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { DELETE_RECIPE } from '../graphql/mutations';
import { GET_ME, GET_RECIPES } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

const StarIcon = memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 inline-block" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
));

StarIcon.displayName = 'StarIcon';

const RecipeCard = ({ recipe }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnRecipe = user?.id === recipe.createdBy?.id;

  const [deleteRecipe, { loading: deleteLoading }] = useMutation(DELETE_RECIPE, {
    onCompleted: () => {
      alert('Recipe deleted successfully');
      window.location.reload();
    },
    onError: (error) => {
      console.error('Delete Recipe Error:', error);
      alert('Failed to delete recipe');
    },
    refetchQueries: [{ query: GET_ME }, { query: GET_RECIPES }],
    awaitRefetchQueries: true
  });

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe({
          variables: { id: recipe.id }
        });
      } catch (error) {
        // Error is handled in onError callback
      }
    }
  };

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <div className="recipe-card">
        {isOwnRecipe && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="absolute top-4 right-4 z-10 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            aria-label="Delete recipe"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6"
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

        <h2 className="heading-primary mb-2 pr-8">{recipe.title}</h2>
        <p className="text-content mb-4">Category: {recipe.category}</p>
        <div className="flex justify-between items-center">
          <p className="text-content text-sm">
            By {recipe.createdBy?.username || 'Unknown'}
          </p>
          <div className="text-yellow-500 flex items-center">
            {recipe.averageRating ? (
              <>
                <span className="mr-1 dark:text-yellow-400">{recipe.averageRating.toFixed(1)}</span>
                <StarIcon />
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">No ratings</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

RecipeCard.displayName = 'RecipeCard';

export default memo(RecipeCard); 