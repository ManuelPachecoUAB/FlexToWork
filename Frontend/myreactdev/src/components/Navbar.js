import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import '../estilos/Navbar.css';
import axios from "axios";

// Componente Navbar para utilizadores não logados
function Navbar() {
    const navigate = useNavigate();

    // Função para lidar com o logout
    const handleLogout = () => {
        // Chama o endpoint de logout do backend
        axios.get('http://127.0.0.1:5000/logout')
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
            </ul>
        </nav>
    );
}

export default Navbar;