// src/routes/ProtectedRoutes.js
import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';

const ProtectedRoutes = () => {
    const { isAuthenticated, user } = persistMiddleware();
    const { ok, setOk } = useState(false)
    const location = useLocation();
  

    return isAuthenticated ? <Outlet /> : <Navigate to='/auth/login' />;
};

export default ProtectedRoutes;