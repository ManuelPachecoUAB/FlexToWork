import React from 'react';
import { Link,useNavigate  } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Call the backend logout endpoint
        axios.get('/logout') // Assuming the backend is proxied correctly
            .then(response => {
                // If using sessions, the backend will clear the session
                // Clear any frontend storage or state
                sessionStorage.removeItem('userToken');
                localStorage.removeItem('userToken');
                // Redirect to the login page or landing page
                navigate('/login');
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    };

    return (
        <div className="main-container">
            <div>
                <Navbar />
                <div className="welcome-section">
                    <img src="/Frontend/myreactdev/public/img/logo.png" alt="Welcome" className="welcome-image" />
                </div>
            </div>
        </div>
    );
}