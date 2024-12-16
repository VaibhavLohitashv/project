import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Root = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="px-0 py-8 min-h-screen page-gradient">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Root; 