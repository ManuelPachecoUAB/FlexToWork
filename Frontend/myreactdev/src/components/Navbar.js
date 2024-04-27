import React from 'react';
import { Link } from 'react-router-dom';
import '../estilos/Navbar.css'; // Make sure the navbar styles are located here

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo-container">
                <Link to="/" className="navbar-logo">
                    <img src="/Frontend/myreactdev/public/img/logo.png" alt="Flex2Work" />
                </Link>
            </div>
            <ul className="nav-menu">
                <li className="nav-item">
                    <Link to="/login" className="nav-link">LOGIN</Link>
                </li>
                <li className="nav-item">
                    <Link to="/register" className="nav-link">REGISTAR</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
