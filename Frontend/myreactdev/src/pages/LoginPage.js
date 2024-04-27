//C:\react-js\myreactdev\src\pages\LoginPage.js
import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import Navbar from '../components/Navbar';
import '../estilos/LoginPage.css';
import Colaborador from "./Colaborador";

export default function LoginPage(){

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const navigate = useNavigate();

    const logInUser = () => {
        if(email.length === 0){
            alert("Email has left Blank!");
        }
        else if(password.length === 0){
            alert("password has left Blank!");
        }
        else{
            axios.post('http://127.0.0.1:5000/login', {
                email: email,
                password: password
            })
                .then(function (response) {
                    console.log(response);
                    const token = response.data.access_token;
                    localStorage.setItem('userToken', token);
                    if (response.idnivel = 1) {
                        navigate("/Colaborador");
                    }
                    else{
                        navigate("/");
                    }
                })
                .catch(function (error) {
                    console.error('Login error:', error);
                    if (error.response && error.response.status === 401) {
                        alert("Invalid credentials");
                    } else {
                        // Handle no response scenario
                        alert("An error occurred. Please check your connection and try again.");
                    }
                });
        }
    }

    return (
            <div>
                <Navbar />
                <div className="login-container">
                    <div className="login-form-container">
                        <h1 className="login-title">Bem vindo!</h1>
                        <p className="login-subtitle">Por-favor entrar os dados de login</p>

                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className="login-input" placeholder="Email" />

                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                               className="login-input" placeholder="Password" />

                        <button onClick={logInUser} className="login-button">Login</button>

                        <div className="login-footer">
                            <a href="/forgot-password" className="login-forgot-link">Esqueceste-te da password?</a>
                            <p className="login-register-link">Esqueceste-te da conta? <a href="/register">Registar</a></p>
                        </div>
                    </div>
                </div>
            </div>
    );
}