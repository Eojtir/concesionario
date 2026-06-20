import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { Loading } from '../../components/ui/Loading'; // Tu componente

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles y el usuario no tiene uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};