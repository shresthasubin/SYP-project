import React from 'react'
import Movies from '../components/Movies.jsx'

const MoviesPage = () => {
  return (
    <div className="py-20 pt-24 container mx-auto px-6">
      <h1 className="text-4xl font-extrabold mb-6 text-white">All Movies</h1>
      <p className="text-text-secondary mb-8">Discover what's playing now and coming soon — click any poster to view details.</p>
      <Movies />
    </div>
  )
}

export default MoviesPage
