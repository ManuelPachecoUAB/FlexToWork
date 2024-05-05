//C:\react-js\myreactdev\src\pages\RegisterPage.js
import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import Navbar from '../components/Navbar';
import '../estilos/Registo.css';

export default function RegisterPage(){

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');

    const navigate = useNavigate();

    const registerUser = () => {
        axios.post('http://127.0.0.1:5000/signup', {
            email: email,
            password: password
        })
            .then(function (response) {
                console.log(response);
                navigate("/");
            })
            .catch(function (error) {
                console.log(error, 'error');
                if (error.response.status === 401) {
                    alert("Invalid credentials");
                }
            });
    };


    return (
        <div>
            <Navbar />
            <div className="form-container">
                <div className="form-content">
                    <h1 className="form-title">Create Your Account</h1>

                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                           className="form-input" placeholder="Email" />

                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                           className="form-input" placeholder="Password" />

                    <button onClick={registerUser} className="form-button">Sign Up</button>

                    <div className="form-footer">
                        <a href="/forgot-password" className="form-forgot-link">Forgot password?</a>
                        <p className="form-login-link">Have an account? <a href="/login">Login</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}