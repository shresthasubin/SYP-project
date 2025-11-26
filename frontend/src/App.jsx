import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MovieList from './pages/Movies/MovieList';
import HallList from './pages/Halls/HallList';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/movies" element={<MovieList />} />
      <Route path="/halls" element={<HallList />} />
    </Routes>
  );
}

export default App;
