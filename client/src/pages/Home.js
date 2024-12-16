import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECIPES } from '../graphql/queries';
import RecipeCard from '../components/RecipeCard';
import { RECIPE_CATEGORIES } from '../utils/constants';
import { debounce } from 'lodash';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  
  const { loading, error, data } = useQuery(GET_RECIPES, {
    variables: { searchTerm: debouncedSearchTerm, category },
  });

  useEffect(() => {
    const debouncedSearch = debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 300);

    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

  const categories = ['All', ...RECIPE_CATEGORIES];

  const filteredRecipes = data?.recipes?.filter(recipe => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (recipe.title?.toLowerCase().includes(searchLower)) ||
      (recipe.category?.toLowerCase().includes(searchLower)) ||
      (Array.isArray(recipe.ingredients) && recipe.ingredients.some(ing => 
        ing?.toLowerCase().includes(searchLower)
      )) ||
      (recipe.instructions?.toLowerCase().includes(searchLower))
    );
  }) || [];

  return (
    <div className="page-layout">
      <div className="content-section">
        <div className="container-center">
          <h1 className="heading-primary mb-8">
            Discover Recipes
          </h1>
          
          <div className="flex justify-center space-x-4 mb-8">
            <input
              type="text"
              placeholder="Search recipes by title, ingredients, or instructions..."
              className="input-field max-w-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
            
            <select
              className="select-field max-w-xs"
              value={category}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {loading && <div className="loading-spinner" />}
          {error && <div className="error-message">{error.message}</div>}
          
          {!loading && !error && (
            <>
              {filteredRecipes.length === 0 ? (
                <p className="text-center text-gray-400">
                  No recipes found. Try adjusting your search.
                </p>
              ) : (
                <div className="card-grid">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 