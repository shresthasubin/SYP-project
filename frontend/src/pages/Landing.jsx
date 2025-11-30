import Movies from "../components/Movies.jsx";
import Halls from "../components/Halls.jsx";
import Hero from "../components/hero.jsx";
import React from 'react'

export default function Landing() {
  return (
    <div>
      <Hero />
        <Movies />
        <Halls />
    </div>
  )
}
