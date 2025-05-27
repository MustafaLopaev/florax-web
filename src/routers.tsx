// src/routes/router.tsx

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import Loader from './components/common/Loader';

// Make Loader a generic function to accept the component's props type
const LoaderWrapper =
  <P extends object>(Component: React.FC<P>) =>
  (props: P) => {
    return (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );
  };

const HomePage = LoaderWrapper(lazy(() => import('./pages/HomePage')));

// The router configuration array
const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />, // Parent layout
    // errorElement: <ErrorPage />, // Fallback for route errors
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);

export default router;
