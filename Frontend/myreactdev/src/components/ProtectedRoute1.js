import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute1 = ({ children }) => {
    const isAuthenticated = localStorage.getItem('userToken');

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute1;
