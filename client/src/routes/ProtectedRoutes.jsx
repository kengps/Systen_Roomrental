// src/routes/ProtectedRoutes.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';

const ProtectedRoutes = () => {
    const { isAuthenticated } = persistMiddleware();
    console.log(`⩇⩇:⩇⩇🚨  file: ProtectedRoutes.jsx:8  isAuthenticated :`, isAuthenticated);


    return isAuthenticated ? <Outlet /> : <Navigate to='/auth/login' />;
};

export default ProtectedRoutes;