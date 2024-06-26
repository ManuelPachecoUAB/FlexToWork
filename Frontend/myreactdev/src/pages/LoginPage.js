import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import Navbar from '../components/Navbar';
import '../estilos/LoginPage.css';

// Componente de página de login
export default function LoginPage(){
    // Definição dos estados para email e senha
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const navigate = useNavigate();

    // Função para "logar" o utilizador
    const logInUser = () => {
        if(email.length === 0){
            alert("Email vazio!");
        }
        else if(password.length === 0){
            alert("Password vazia!");
        }
        else{
            // Chamada API login
            axios.post('http://127.0.0.1:5000/login', {
                email: email,
                password: password
            })
                .then(function (response) {
                    console.log(response);
                    const token = response.data.access_token;
                    const nivel = response.data.idnivel;
                    // Redirecionamento baseado no nível de acesso do utilizador
                    if (nivel === 1) {
                        navigate("/Colaborador");
                        localStorage.setItem('nivel', nivel);
                        localStorage.setItem('userToken', token);
                    }
                    else if (nivel === 2) {
                        navigate("/Manager");
                        localStorage.setItem('nivel', nivel);
                        localStorage.setItem('userToken', token);
                    }
                    else if (nivel === 3) {
                        navigate("/RH");
                        localStorage.setItem('nivel', nivel);
                        localStorage.setItem('userToken', token);
                    }
                    else if (nivel === 4) {
                        navigate("/RH");
                        localStorage.setItem('nivel', nivel);
                        localStorage.setItem('userToken', token);
                    }
                    else if (nivel === 5) {
                        navigate("/Admin");
                        localStorage.setItem('nivel', nivel);
                        localStorage.setItem('userToken', token);
                    }
                    else{
                        navigate("/");
                    }
                })
                .catch(function (error) {
                    console.error('Login error:', error);
                    if (error.response && error.response.status === 401) {
                        alert("Credenciais invalidas");
                    } else {
                        // Handle no response scenario
                        alert("Erro. Verificar Ligação e tentar novamente.");
                    }
                });
        }
    }

    return (
        <div>
            <Navbar />
            <div className="login-container">
                <div className="login-form-container">
                    <h1 className="login-title">Bem Vindo!</h1>
                    <p className="login-subtitle">Por favor coloque os dados de login</p>

                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                           className="login-input" placeholder="Email" />

                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                           className="login-input" placeholder="Password" />

                    <button onClick={logInUser} className="login-button">Login</button>
                </div>
            </div>
        </div>
    );
}