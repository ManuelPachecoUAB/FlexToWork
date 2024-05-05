import React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import '../estilos/NavbarAdmin.css';
import axios from "axios";

function NavbarAdmin() {
    const navigate = useNavigate();

    const handleLogout = () => {
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
        <nav className="NavbarAdmin">
            <div className="logo-container">
                <Link to="/" className="navbar-logo">
                    <img src={'/img/logo.png'} alt="Flex2Work" />
                </Link>
            </div>
            <ul className="nav-menu">
                <li className="nav-item"><button onClick={handleLogout} className="nav-link">Logout</button></li>
            </ul>
        </nav>
    );
}

export default NavbarAdmin;
