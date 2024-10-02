// src/routes/ProtectedRoutes.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';

const ProtectedRoutes = () => {
    const { isAuthenticated } = persistMiddleware();

    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />;
};

export default ProtectedRoutes;