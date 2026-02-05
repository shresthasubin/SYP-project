import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Ticket } from 'lucide-react'

const MOVIES = [
  { id: 1, title: 'Dune: Part Two', rating: 9.4, genre: 'Sci-Fi', desc: 'A sprawling sci-fi epic continuing the saga on Arrakis.', image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'Oppenheimer', rating: 9.6, genre: 'Drama', desc: 'A biographical examination of J. Robert Oppenheimer.', image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop' }
]

export default function MovieDetail(){
  const { id } = useParams()
  const movie = MOVIES.find(m => String(m.id) === String(id)) || MOVIES[0]

  return (
    <section className="min-h-[60vh] flex items-center py-20 pt-24 bg-secondary/40">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 bg-primary rounded-xl overflow-hidden shadow-xl">
            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-4xl font-extrabold mb-4">{movie.title}</h2>
            <div className="flex items-center gap-4 text-text-secondary mb-6">
              <div className="flex items-center gap-2 text-[#ffd700]"><Star size={18} fill="#ffd700" strokeWidth={0} /> <strong className="text-white">{movie.rating}</strong></div>
              <span className="px-3 py-1 border border-white/10 rounded text-sm">{movie.genre}</span>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">{movie.desc}</p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Showtimes</h4>
                <ul className="text-text-secondary text-sm space-y-2">
                  <li>11:00 AM — Standard</li>
                  <li>2:30 PM — IMAX</li>
                  <li>6:45 PM — Dolby Atmos</li>
                </ul>
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Duration</h4>
                <p className="text-text-secondary text-sm">2h 40m — including trailers</p>
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Formats</h4>
                <p className="text-text-secondary text-sm">IMAX · Dolby Atmos · 4DX</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Cast & Crew</h4>
              <div className="flex gap-3 items-center text-sm text-text-secondary">
                <span>Director: Jane Doe</span>
                <span>·</span>
                <span>Stars: Actor A, Actor B</span>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Link to="/movies" className="inline-block px-6 py-3 border border-white/10 rounded-md text-sm font-semibold hover:bg-white/5">Back to list</Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md font-semibold hover:bg-accent-hover transition-all"><Ticket size={16}/> Book Tickets</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
