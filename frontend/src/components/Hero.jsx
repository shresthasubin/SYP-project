import React, { useState, useEffect } from "react";
import { Play, Ticket, Star, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css";
const HERO_SLIDES = [
  {
    id: 1,
    title: "INTERSTELLAR ODYSSEY",
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop",
    rating: 9.8,
    year: "2024",
    duration: "2h 45m",
    genre: "Sci-Fi / Adventure",
    desc: "Embark on a journey beyond the stars. When humanity's time on Earth comes to an end, a team of explorers undertakes the most important mission in human history.",
  },
  {
    id: 2,
    title: "DUNE: PART TWO",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2568&auto=format&fit=crop",
    rating: 9.4,
    year: "2024",
    duration: "2h 46m",
    genre: "Sci-Fi / Action",
    desc: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  },
  {
    id: 3,
    title: "OPPENHEIMER",
    image:
      "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop",
    rating: 9.6,
    year: "2023",
    duration: "3h 00m",
    genre: "Biography / Drama",
    desc: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="h-screen w-full relative flex items-center text-white overflow-hidden bg-black">
      <AnimatePresence>
        <motion.div
          key={slide.id}
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-0 left-0 w-full h-full -z-10">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover animate-pan-zoom"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 via-black/50 to-primary"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 relative z-10 pt-20 max-w-7xl">
        <motion.div
          key={`content-${slide.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full font-bold text-sm mb-6 border border-accent/20 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Now Premiering
          </motion.span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-2xl">
            {slide.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-10 text-gray-300 text-lg font-medium">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
              <Star
                fill="#ffd700"
                className="text-[#ffd700]"
                size={20}
                strokeWidth={0}
              />
              <span className="text-white font-bold">{slide.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-accent" />
              <span>{slide.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-accent" />
              <span>{slide.duration}</span>
            </div>
            <span className="px-3 py-1 rounded-full border border-white/20 text-sm uppercase tracking-wide">
              {slide.genre}
            </span>
          </div>

          <p className="text-xl md:text-2xl leading-relaxed text-gray-300 mb-12 max-w-2xl font-light">
            {slide.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <button aria-label={`Book ${slide.title} tickets`} className="group bg-accent text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-accent-hover hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:shadow-[0_0_50px_rgba(229,9,20,0.6)]">
              <Ticket
                size={24}
                className="group-hover:rotate-12 transition-transform"
              />
              Book Tickets
            </button>
            <button aria-label={`Watch ${slide.title} trailer`} className="group bg-white/5 text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-xl flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={14} fill="currentColor" className="ml-0.5" />
              </div>
              Watch Trailer
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 right-12 flex gap-4 z-20">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === currentSlide}
            className={`group relative h-2 transition-all duration-300 ${
              index === currentSlide ? "w-4" : "w-4 hover:bg-white/40"
            }`}
            onClick={() => setCurrentSlide(index)}
          >
            <div
              className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                index === currentSlide ? "bg-accent" : "bg-white/20"
              }`}
            ></div>
            {index === currentSlide && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 bg-accent rounded-full shadow-[0_0_15px_rgba(229,9,20,0.8)]"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
