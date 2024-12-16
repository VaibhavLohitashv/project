import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import { AuthProvider } from './context/AuthContext';

import Root from './components/Root';
import MinimalHeader from './components/MinimalHeader';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Profile from './pages/Profile';

const routes = [
  {
    path: '/',
    element: <Root />,
    children: [
      { 
        index: true, 
        element: <Home /> 
      },
      { 
        path: 'recipe/:id', 
        element: <RecipeDetail /> 
      },
      { 
        path: 'create', 
        element: <CreateRecipe /> 
      },
      { 
        path: 'profile', 
        element: <Profile /> 
      },
    ]
  },
  {
    path: 'login',
    element: (
      <>
        <MinimalHeader />
        <Login />
      </>
    )
  },
  {
    path: 'signup',
    element: (
      <>
        <MinimalHeader />
        <Signup />
      </>
    )
  }
];

const routerOptions = {
  basename: '/',
  future: {
    v7_startTransition: true,
    v7_normalizeFormMethod: true,
    v7_prependBasename: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_routerHydration: true,
    v7_errorBoundary: true,
    v7_skipActionErrorRevalidation: true
  },
  hydrationData: {
    loaderData: {},
    actionData: null,
    errors: null
  }
};

const router = createBrowserRouter(routes, routerOptions);

const App = () => {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={null} />
      </AuthProvider>
    </ApolloProvider>
  );
};

export default App; 