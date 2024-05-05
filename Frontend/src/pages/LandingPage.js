import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../estilos/Welcome.css'; //

export default function LandingPage() {
    return (
        <div className="main-container">
            <div>
                <Navbar />
                <div className="welcome-section">
                    <img src={'/img/logo.png'} alt="Welcome" className="welcome-image" />
                    <h1 className="welcome-text">Bem-vindo ao Flex2Work</h1>
                    <p className="welcome-subtext">A tua ferramenta de gestão de Idas ao escritorio e muito mais</p>
                </div>
            </div>
        </div>
    );
}
