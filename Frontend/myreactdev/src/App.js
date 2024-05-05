import React, { } from 'react';
import './App.css';
  
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
  
import LandingPage from "./pages/LandingPage";
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Colaborador from './pages/Colaborador'
import Logout from './pages/Logout'
import ProtectedRoute from './components/ProtectedRoute';

 
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/colaborador" element={
                  <ProtectedRoute>
                      <Colaborador />
                  </ProtectedRoute>
              } />
              <Route path="/logout" element={<Logout />} />
          </Routes>
      </BrowserRouter>
  );
}
   
export default App;