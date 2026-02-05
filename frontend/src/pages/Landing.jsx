import Movies from "../components/Movies.jsx";
import Halls from "../components/Halls.jsx";
import Hero from "../components/Hero.jsx";
import React from "react";

export default function Landing() {
  return (
    <div>
      <Hero />
      <div className="pt-12">
        <Movies />
        <Halls />
      </div>
    </div>
  );
}
