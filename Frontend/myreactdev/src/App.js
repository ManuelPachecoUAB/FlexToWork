import React, { } from 'react';
import './App.css';
  
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';

import LoginPage from './pages/LoginPage'
import Colaborador from './pages/Colaborador'
import Manager from './pages/Manager'
import RH from './pages/RH'
import Admin from './pages/Admin'
import Logout from './pages/Logout'
import ProtectedRoute1 from './components/ProtectedRoute1';
import ProtectedRoute2 from './components/ProtectedRoute2';
import ProtectedRoute3 from './components/ProtectedRoute3';
import ProtectedRoute4 from './components/ProtectedRoute4';

 
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/login" element={<LoginPage />} />
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
                  <ProtectedRoute4>
                      <Admin />
                  </ProtectedRoute4>
              } />
              <Route path="/logout" element={<Logout />} />
          </Routes>
      </BrowserRouter>
  );
}
   
export default App;