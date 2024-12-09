import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECIPES } from '../graphql/queries';
import RecipeCard from '../components/RecipeCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  
  const { loading, error, data } = useQuery(GET_RECIPES, {
    variables: { searchTerm, category },
  });

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