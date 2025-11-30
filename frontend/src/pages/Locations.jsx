import React from 'react'
import Halls from '../components/Halls.jsx'

const Locations = () => {
  return (
    <div className="py-20 container mx-auto px-6">
      <h1 className="text-4xl font-extrabold mb-6">Locations & Halls</h1>
      <p className="text-text-secondary mb-8">Find a CineHall near you — each location offers distinct experiences.</p>
      <Halls />
    </div>
  )
}

export default Locations
