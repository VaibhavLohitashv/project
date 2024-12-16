import { memo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import RecipeCard from '../components/RecipeCard';

const LoadingState = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
    <div className="loading-spinner" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
    <div className="error-message">{message}</div>
  </div>
);

const NoDataState = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
    <div className="text-gray-400">No user data found</div>
  </div>
);

const Profile = () => {
  const { loading, error, data } = useQuery(GET_ME);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.me) return <NoDataState />;

  const { me } = data;

  return (
    <div className="page-layout">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-heading">Profile</h1>
          <div className="space-y-2">
            <p className="profile-text">
              <span className="font-semibold">Username:</span> {me.username}
            </p>
            <p className="profile-text">
              <span className="font-semibold">Email:</span> {me.email}
            </p>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-subheading">My Recipes</h2>
          {!me.recipes?.length ? (
            <p className="profile-text">
              You haven't created any recipes yet.
            </p>
          ) : (
            <div className="card-grid">
              {me.recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Profile); 