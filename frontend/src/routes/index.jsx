import { Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Register from '../pages/Auth/Register';
import Auth from '../pages/Auth/Auth';
import ResetPassword from '../pages/Auth/ResetPassword';
import Home from '../pages/Home/Home';
import Exercises from '../pages/Home/Exercises';
import Dashboard from '../pages/Home/Dashboard';

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
        path: '',
        element: <Navigate to="/auth/login" />,
      },
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
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: 'home',
    element: <Home />,
    children: [
      {
        path: '',
        element: <Navigate to="/home/dashboard" />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'exercises',
        element: <Exercises />,
      },
    ],
  },
];
