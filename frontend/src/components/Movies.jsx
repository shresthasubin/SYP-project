import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Ticket, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import "../index.css";

/* ===== CONFIG ===== */
const CARD_WIDTH = 300;
const CARD_HEIGHT = 400;
const GAP = 20;
const SLIDE_WIDTH = CARD_WIDTH + GAP;
const SPRING = { type: "spring", stiffness: 300, damping: 30 };

/* ===== DATA ===== */
function MovieCard({
  title,
  year,
  director,
  duration,
  rating,
  tags,
  image,
  accent = "bg-pink-500",
  reverse = false,
}) {
  return (
    <div className="relative w-[300px] h-[500px] rounded-[35px] shadow-[0_0_50px_#0F274D] overflow-hidden group">
      {/* Watch Card */}
      <div
        className={`absolute inset-0 ${accent} -z-10 flex items-end justify-center pb-4`}
      >
        <button className="uppercase font-bold text-lg tracking-wide text-white hover:text-gray-200">
          watch now
        </button>
      </div>

      {/* Content Card */}
      <div
        className={`absolute inset-0 p-6 rounded-[35px] overflow-hidden transition-all duration-500
        ${reverse ? "top-[-50px] group-hover:top-0" : "group-hover:-top-[50px]"}`}
      >
        <img
          src={image}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500
          ${reverse ? "scale-110 group-hover:scale-100" : "group-hover:scale-110"}`}
        />

        {/* Shadow */}
        <div className="absolute bottom-0 w-full h-[170px] bg-[#0F274D] blur-xl shadow-[0_0_20px_20px_#0F274D]" />

        {/* Content */}
        <div className="absolute bottom-6 text-white">
          <h1 className="text-3xl font-bold capitalize">{title}</h1>
          <p className="text-sm text-gray-300 font-semibold capitalize">
            {year} · {director}
          </p>

          <b className="block mt-1">{duration}</b>

          {/* Stars */}
          <div className="mt-2 text-sm text-gray-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`fa fa-star ${i <= rating ? "text-orange-400" : ""}`}
              />
            ))}
          </div>

          {/* Tags */}
          <div className="flex gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full bg-white/20"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Arrow */}
          <i
            className={`fa ${
              reverse ? "fa-angle-down" : "fa-angle-up"
            } absolute left-1/2 -translate-x-1/2 -bottom-4 text-2xl text-gray-400`}
          />
        </div>
      </div>
    </div>
  );
}





/* ===== CAROUSEL COMPONENT ===== */


/* ===== MAIN MOVIES COMPONENT ===== */
const Movies = () => {
  const movies = [
    {
      title: "aladdin",
      year: "2019",
      director: "Guy Ritchie",
      duration: "2h 10m",
      rating: 4,
      tags: ["action", "romantic", "family"],
      image: "https://pad.mymovies.it/filmclub/2017/11/159/locandina.jpg",
      accent: "bg-pink-500"
    },
    {
      title: "The Lion King",
      year: "2019",
      director: "Jon Favreau",
      duration: "1h 58m",
      rating: 5,
      tags: ["adventure", "family", "animation"],
      image: "https://m.media-amazon.com/images/I/81x1-7zDMsL._SL1500_.jpg",
      accent: "bg-yellow-500"
    },
    {
      title: "Joker",
      year: "2019",
      director: "Todd Phillips",
      duration: "2h 2m",
      rating: 4,
      tags: ["drama", "thriller", "crime"],
      image: "https://www.tallengestore.com/cdn/shop/products/Joker_-_Put_On_A_Happy_Face_-_Joaquin_Phoenix_-_Hollywood_English_Movie_Poster_3_0e557717-f9ae-4d45-82c3-27e08c2a9eeb.jpg",
      accent: "bg-purple-500"
    },{
       title: "aladdin",
      year: "2019",
      director: "Guy Ritchie",
      duration: "2h 10m",
      rating: 4,
      tags: ["action", "romantic", "family"],
      image: "https://pad.mymovies.it/filmclub/2017/11/159/locandina.jpg",
      accent: "bg-pink-500"
    },
    {
      title: "The Lion King",
      year: "2019",
      director: "Jon Favreau",
      duration: "1h 58m",
      rating: 5,
      tags: ["adventure", "family", "animation"],
      image: "https://m.media-amazon.com/images/I/81x1-7zDMsL._SL1500_.jpg",
      accent: "bg-yellow-500"
    },{
       title: "aladdin",
      year: "2019",
      director: "Guy Ritchie",
      duration: "2h 10m",
      rating: 4,
      tags: ["action", "romantic", "family"],
      image: "https://pad.mymovies.it/filmclub/2017/11/159/locandina.jpg",
      accent: "bg-pink-500"
    },
    {
      title: "The Lion King",
      year: "2019",
      director: "Jon Favreau",
      duration: "1h 58m",
      rating: 5,
      tags: ["adventure", "family", "animation"],
      image: "https://m.media-amazon.com/images/I/81x1-7zDMsL._SL1500_.jpg",
      accent: "bg-yellow-500"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mb-4">
          Featured Movies
        </h2>
        <div className="relative">
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {movies.map((movie, index) => (
              <div key={index} className="flex-shrink-0 w-80">
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movies;
