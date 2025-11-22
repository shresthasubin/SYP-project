import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/login.jsx";
import Register from "./auth/register.jsx";



const App = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Coming Soon</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
