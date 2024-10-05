import React from 'react'
import { Navigate } from 'react-router-dom';

const NavigateToDb = () => {
    
    return (
        <Navigate to="/admin/dashboard" replace />
    )
}

export default NavigateToDb