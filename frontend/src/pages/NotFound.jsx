import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-7xl font-extrabold mb-4 text-accent">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        <p className="text-text-secondary mb-6">Looks like the page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="px-6 py-3 bg-accent text-white rounded-md font-semibold">Return home</Link>
      </div>
    </section>
  )
}

export default NotFound
