import React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import '../estilos/NavbarLogado.css';
import axios from "axios"; // Make sure the navbar styles are located here

function NavbarManager() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Call the backend logout endpoint
        axios.get('http://127.0.0.1:5000/logout') // Assuming the backend is proxied correctly
            .then(response => {
                sessionStorage.removeItem('userToken');
                localStorage.removeItem('userToken');
                navigate('/login');
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    };

    return (
        <nav className="NavbarManager">
            <div className="logo-container">
                <Link to="/" className="navbar-logo">
                    <img src={'/img/logo.png'} alt="Flex2Work" />
                </Link>
            </div>
            <ul className="nav-menu">
                <li className="nav-item">
                    <Link to="/Colaborador" className="nav-link">Colaborador</Link>
                </li>
                <li className="nav-item">
                    <Link to="/Manager" className="nav-link">Manager</Link>
                </li>
                <li className="nav-item">
                    <button onClick={handleLogout} className="nav-link">LOGOUT</button>
                </li>
            </ul>
        </nav>
    );
}

export default NavbarManager;
