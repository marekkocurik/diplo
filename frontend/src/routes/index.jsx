import { Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Register from '../pages/Auth/Register';
import Auth from '../pages/Auth/Auth';

export default [
  {
    path: '',
    element: <Navigate to="/auth/login" />,
  },
  {
    path: 'auth',
    element: <Auth />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
];
