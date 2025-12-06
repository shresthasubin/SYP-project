import React, { useState, useEffect } from "react";
import { Play, Ticket, Star, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import img1 from "../assets/Interstellar.jpg";
import img2 from "../assets/Oppenheimer.jpg";
import img3 from "../assets/Dune.jpg";

import "../index.css";

const SLIDE_DURATION = 9000; // ms
const TRANSITION_DURATION = 1.2; // seconds

const HERO_SLIDES = [
  {
    id: 1,
    title: "INTERSTELLAR ODYSSEY",
    image: img1,
    rating: 9.8,
    year: "2024",
    duration: "2h 45m",
    genre: "Sci-Fi / Adventure",
    desc: "Embark on a journey beyond the stars. When humanity's time on Earth comes to an end, a team of explorers undertakes the most important mission in human history.",
  },
  {
    id: 2,
    title: "DUNE: PART TWO",
    image: img3,
    rating: 9.4,
    year: "2024",
    duration: "2h 46m",
    genre: "Sci-Fi / Action",
    desc: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  },
  {
    id: 3,
    title: "OPPENHEIMER",
    image: img2,
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
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`bg-${slide.id}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover animate-pan-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-primary" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`content-${slide.id}`}
          className="relative z-10 h-full flex items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: TRANSITION_DURATION, ease: "easeOut", delay: 0.1 }}
        >
          <div className="container mx-auto px-6 max-w-7xl pt-20">
            <motion.span
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: TRANSITION_DURATION, ease: "easeOut", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full font-bold text-sm mb-6 border border-accent/20 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Now Premiering
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: TRANSITION_DURATION, ease: "easeOut", delay: 0.25 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-2xl"
            >
              {slide.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: TRANSITION_DURATION, ease: "easeOut", delay: 0.35 }}
              className="flex flex-wrap items-center gap-4 md:gap-8 mb-10 text-gray-300 text-lg font-medium"
            >
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                <Star fill="#ffd700" className="text-[#ffd700]" size={20} strokeWidth={0} />
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
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: TRANSITION_DURATION, ease: "easeOut", delay: 0.4 }}
              className="text-xl md:text-2xl leading-relaxed text-gray-300 mb-12 max-w-2xl font-light"
            >
              {slide.desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: TRANSITION_DURATION, ease: "easeOut", delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <button className="group bg-accent text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-accent-hover hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:shadow-[0_0_50px_rgba(229,9,20,0.6)]">
                <Ticket size={24} className="group-hover:rotate-12 transition-transform" />
                Book Tickets
              </button>
              <button className="group bg-white/5 text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-xl flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </div>
                Watch Trailer
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 right-12 flex gap-4 z-20">
        {HERO_SLIDES.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => setCurrentSlide(index)}
            className={`group relative h-2 transition-all duration-500 ${
              index === currentSlide ? "w-6" : "w-4"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                index === currentSlide ? "bg-accent" : "bg-white/20"
              }`}
            ></div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
