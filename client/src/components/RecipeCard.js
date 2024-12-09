import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';

const RecipeCard = ({ recipe }) => {
  if (!recipe) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {recipe.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            By {recipe.createdBy?.username || 'Unknown User'}
          </span>
          
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-sm text-gray-600">
              {recipe.averageRating?.toFixed(1) || 'No ratings'}
            </span>
          </div>
        </div>
        
        <div className="mt-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {recipe.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 