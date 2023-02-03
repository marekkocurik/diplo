import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
