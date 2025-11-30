import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import "../index.css";
const MOVIES = [
  {
    id: 1,
    title: "Dune: Part Two",
    rating: 9.4,
    genre: "Sci-Fi",
    category: "Now Showing",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Oppenheimer",
    rating: 9.6,
    genre: "Drama",
    category: "Now Showing",
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "The Batman",
    rating: 8.9,
    genre: "Action",
    category: "Exclusive",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Avatar: Way of Water",
    rating: 8.7,
    genre: "Adventure",
    category: "Now Showing",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1968&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Cyberpunk: Edgerunners",
    rating: 9.1,
    genre: "Anime",
    category: "Coming Soon",
    image: "https://images.unsplash.com/photo-1614726365723-49cfae927836?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Blade Runner 2049",
    rating: 9.2,
    genre: "Sci-Fi",
    category: "Exclusive",
    image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop"
  }
];

const Movies = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredMovies = activeFilter === 'All' 
    ? MOVIES 
    : MOVIES.filter(movie => movie.category === activeFilter || movie.category === 'Now Showing' && activeFilter === 'Now Showing');

  const navigate = useNavigate();

  const handleOpen = (movie) => {
    // navigate to details using movie id
    navigate(`/movies/${movie.id}`);
  };

  return (
    <section className="py-16 relative container mx-auto px-6" id="movies">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-accent">Now</span> Showing
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['All', 'Now Showing', 'Coming Soon', 'Exclusive'].map((filter) => (
            <button
              key={filter}
              className={`px-6 py-2 rounded-full border border-white/10 font-medium transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-accent text-white border-accent' 
                  : 'text-text-secondary hover:bg-accent hover:text-white hover:border-accent'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
        <AnimatePresence>
          {filteredMovies.map((movie) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={movie.id} 
                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[2/3] shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                onClick={() => handleOpen(movie)}
            >
              <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-xl font-bold mb-2 text-white">{movie.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-300 mb-4">
                  <span>{movie.genre}</span>
                  <div className="flex items-center gap-1 text-[#ffd700]">
                    <Star size={14} fill="#ffd700" strokeWidth={0} />
                    <span>{movie.rating}</span>
                  </div>
                </div>
                <button className="w-full py-3 bg-accent text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors">
                  <Ticket size={16} />
                  Book Seat
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default Movies;
