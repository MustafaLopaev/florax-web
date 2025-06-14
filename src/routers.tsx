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

const LoadModelLocalPage = LoaderWrapper(
  lazy(() => import('./pages/LoadModelLocal'))
);
const CloudDetectionPage = LoaderWrapper(
  lazy(() => import('./pages/CloudDetection'))
);

const HomePage = LoaderWrapper(lazy(() => import('./pages/HomePage')));

// The router configuration array
const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />, // Parent layout
    // errorElement: <ErrorPage />, // Fallback for route errors
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'load-model-local',
        element: <LoadModelLocalPage />,
      },
      {
        path: 'cloud-detection',
        element: <CloudDetectionPage />,
      },
    ],
  },
]);

export default router;
