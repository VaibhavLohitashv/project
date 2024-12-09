import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import RecipeCard from '../components/RecipeCard';

const Profile = () => {
  const { loading, error, data } = useQuery(GET_ME);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-red-600">Error: {error.message}</div>
    </div>
  );

  if (!data?.me) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">No user data found</div>
    </div>
  );

  const { me } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Username:</span> {me.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {me.email}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">My Recipes</h2>
        {!me.recipes?.length ? (
          <p className="text-gray-600">You haven't created any recipes yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {me.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Saved Recipes</h2>
        {!me.savedRecipes?.length ? (
          <p className="text-gray-600">You haven't saved any recipes yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {me.savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 