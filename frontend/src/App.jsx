import './App.scss';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';
import 'simplebar-react/dist/simplebar.min.css';

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
