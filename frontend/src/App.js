import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/user/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './components/Home';
import CustomAppBar from './components/navigation/CustomAppBar';


function App() {
  return (
      <div>
        <CustomAppBar></CustomAppBar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
  );
}

export default App;
