import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECIPES } from '../graphql/queries';
import { RECIPE_ADDED_SUBSCRIPTION } from '../graphql/subscriptions';
import RecipeCard from '../components/RecipeCard';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const location = useLocation();
  
  const { loading, error, data, subscribeToMore, refetch } = useQuery(GET_RECIPES, {
    variables: { searchTerm, category },
  });

  // Refresh data when component mounts or when returning to home page
  useEffect(() => {
    refetch();
  }, [location, refetch]);

  // Subscription setup
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: RECIPE_ADDED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newRecipe = subscriptionData.data.recipeAdded;

        // Don't add if it doesn't match current filters
        if (category && newRecipe.category !== category) return prev;
        if (searchTerm && !newRecipe.title.toLowerCase().includes(searchTerm.toLowerCase())) return prev;

        return {
          recipes: [newRecipe, ...prev.recipes]
        };
      }
    });

    return () => unsubscribe();
  }, [subscribeToMore, category, searchTerm]);

  const categories = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Vegan',
    'Vegetarian',
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Discover Recipes
        </h1>
        
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search recipes..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Home; 