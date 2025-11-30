import React from 'react'

const About = () => {
  return (
    <section className="py-20 bg-secondary/40">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-extrabold mb-6">About CinemaHub</h1>
        <p className="text-text-secondary leading-relaxed max-w-3xl mb-6">CinemaHub began with a mission to make every movie a memorable event. We combine extraordinary screens and sound design with comfortable seating and hospitality.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-primary p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Premium Experience</h3>
            <p className="text-text-secondary">State-of-the-art projection systems, premium seat options and gourmet concessions.</p>
          </div>
          <div className="bg-primary p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Community & Membership</h3>
            <p className="text-text-secondary">Membership perks, early previews and exclusive members-only screenings.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
