import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import '../estilos/NavbarLogado.css';
import '../estilos/NavbarAdmin.css';
import axios from "axios"; // Make sure the navbar styles are located here

function NavbarLogado() {
    const navigateLogado = useNavigate();
    const isAuthenticated = localStorage.getItem('userToken');
    const nivel = localStorage.getItem('nivel');
    const handleLogout = () => {
        // Call the backend logout endpoint
        axios.get('http://127.0.0.1:5000/logout') // Assuming the backend is proxied correctly
            .then(response => {
                sessionStorage.removeItem('userToken');
                localStorage.removeItem('userToken');
                localStorage.removeItem('nivel');
                navigateLogado('/login');
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    };

    if (isAuthenticated && nivel === '1') {
        return (
            <nav className="NavbarLogado">
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
                        <li className="nav-item"><button onClick={handleLogout} className="nav-link">LOGOUT</button></li>
                    </li>
                </ul>
            </nav>
        );
    }
    else if (isAuthenticated && nivel === '2') {
        return (
            <nav className="NavbarLogado">
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
                        <li className="nav-item"><button onClick={handleLogout} className="nav-link">LOGOUT</button></li>
                    </li>
                </ul>
            </nav>
        );
    }
    else if (isAuthenticated && nivel === '3') {
        return (
            <nav className="NavbarLogado">
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
                        <Link to="/Rh" className="nav-link">RH</Link>
                    </li>
                    <li className="nav-item">
                        <li className="nav-item"><button onClick={handleLogout} className="nav-link">LOGOUT</button></li>
                    </li>
                </ul>
            </nav>
        );
    }
    else if (isAuthenticated && nivel === '4') {
        return (
            <nav className="NavbarLogado">
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
                        <Link to="/Rh" className="nav-link">RH</Link>
                    </li>
                    <li className="nav-item">
                        <li className="nav-item"><button onClick={handleLogout} className="nav-link">LOGOUT</button></li>
                    </li>
                </ul>
            </nav>
        );
    }
    else if (isAuthenticated && nivel === '5') {
        return (
            <nav className="NavbarAdmin">
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
                        <Link to="/Rh" className="nav-link">RH</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/Admin" className="nav-link">Admin</Link>
                    </li>
                    <ul className="nav-menu">
                        <li className="nav-item"><button onClick={handleLogout} className="nav-link">Logout</button></li>
                    </ul>
                </ul>
            </nav>
        );
    }
}

export default NavbarLogado;