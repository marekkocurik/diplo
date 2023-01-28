import { Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

export default [
  {
    path: '/',
    element: <Navigate to="/login"/>,
  },
  {
    path: '/login',
    element: <Login/>,
  },
  {
    path: '/dashboard',
    element: <Dashboard/>,
  }
];
