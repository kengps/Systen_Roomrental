import React from 'react'
import { storeAuth } from '../service/zustand/store/loginStore'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import persistMiddleware from '../service/zustand/middleware/persistMiddleware'




const ProtectedRoutes = ({isAuthenticated}) => {
    const navigate = useNavigate();
    const isLogged = persistMiddleware((state) => state.isAuthenticated)


    return isAuthenticated ? <Outlet /> : <LoadingSpinner />
}

export default ProtectedRoutes