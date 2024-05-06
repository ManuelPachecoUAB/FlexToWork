import React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import '../estilos/Navbar.css';
import axios from "axios"; // Make sure the navbar styles are located here

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Call the backend logout endpoint
        axios.get('http://127.0.0.1:5000/logout') // Assuming the backend is proxied correctly
            .then(response => {
                sessionStorage.removeItem('userToken');
                localStorage.removeItem('userToken');
                localStorage.removeItem('nivel');
                navigate('/login');
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    };

    return (
        <nav className="navbar">
            <div className="logo-container">
                <Link to="/" className="navbar-logo">
                    <img src={'/img/logo.png'} alt="Flex2Work" />
                </Link>
            </div>
            <ul className="nav-menu">
                <li className="nav-item">
                    <Link to="/login" className="nav-link">LOGIN</Link>
                </li>
                <li className="nav-item">
                    <Link to="/register" className="nav-link">REGISTAR</Link>
                </li>
                <li className="nav-item">
                    <button onClick={handleLogout} className="nav-link">LOGOUT</button>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;