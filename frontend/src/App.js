import React from 'react';
import Login from './pages/Login/Login.js';
import HomePage from './pages/HomePage/HomePage.js';
import Profile from './pages/Profile/Profile.js';
import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import { API_BASE_URL } from './config.js';

// Still need error handling for the routes Ie. Error Page.
function App() {

  function PrivateRoute({ children }) {
    const [auth, setAuth] = useState(null);
  
    useEffect(() => {
      fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setAuth(!!data.user));
    }, []);
  
    if (auth === null) return null; 
  
    return children;
    /* removed this for now, to show Profile with null user
    return auth ? children : <Navigate to="/login" replace />;
    */  }

  return (
      <div className="app">
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/home" element={ <HomePage />} />
          <Route exact path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </div>
  );
}

export default App;
