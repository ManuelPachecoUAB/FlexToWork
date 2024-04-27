import React from 'react';
import { Link } from 'react-router-dom';
import NavbarColaborador from '../components/NavbarColaborador';
import '../estilos/Welcome.css'; //

export default function Colaborador() {
    return (
        <div className="main-container">
            <div>
                <NavbarColaborador />
                <div className="welcome-section">
                    <img src="/Frontend/myreactdev/public/img/logo.png" alt="Welcome" className="welcome-image" />
                    <h1 className="welcome-text">Bem-vindo ao Flex2Work</h1>
                </div>
            </div>
        </div>
    );
}