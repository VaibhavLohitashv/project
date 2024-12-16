import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_RECIPE } from '../graphql/mutations';
import { GET_RECIPES } from '../graphql/queries';
import { RECIPE_CATEGORIES } from '../utils/constants';

const CreateRecipe = () => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const [createRecipe, { loading }] = useMutation(CREATE_RECIPE, {
    onCompleted: (data) => {
      navigate(`/recipe/${data.createRecipe.id}`);
    },
    onError: (error) => {
      setError(error.message);
    },
    refetchQueries: [{ query: GET_RECIPES }],
  });

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    
    createRecipe({
      variables: {
        title,
        ingredients: filteredIngredients,
        instructions,
        category,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Recipe</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                className="input-field"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddIngredient}
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
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="form-label">Category</label>
          <select
            className="select-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {RECIPE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Recipe'}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipe; 