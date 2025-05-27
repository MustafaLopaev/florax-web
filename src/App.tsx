import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from './routers';

function App() {
  return (
    <div className="h-screen w-screen bg-gray-100">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
