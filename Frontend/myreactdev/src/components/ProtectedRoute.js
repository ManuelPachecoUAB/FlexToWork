import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('userToken'); // or however you handle authentication tokens

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nice user experience.
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
