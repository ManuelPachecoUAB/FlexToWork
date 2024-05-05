import React, { } from 'react';
import './App.css';
  
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
  
import LandingPage from "./pages/LandingPage";
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Colaborador from './pages/Colaborador'
import Manager from './pages/Manager'
import RH from './pages/RH'
import Admin from './pages/Admin'
import Logout from './pages/Logout'
import ProtectedRoute1 from './components/ProtectedRoute1';
import ProtectedRoute5 from './components/ProtectedRoute5';

 
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/colaborador" element={
                  <ProtectedRoute1>
                      <Colaborador />
                  </ProtectedRoute1>
              } />
              <Route path="/manager" element={
                  <ProtectedRoute2>
                      <Manager />
                  </ProtectedRoute2>
              } />
              <Route path="/rh" element={
                  <ProtectedRoute3>
                      <RH />
                  </ProtectedRoute3>
              } />
              <Route path="/admin" element={
                  <ProtectedRoute5>
                      <Admin />
                  </ProtectedRoute5>
              } />
              <Route path="/logout" element={<Logout />} />
          </Routes>
      </BrowserRouter>
  );
}
   
export default App;