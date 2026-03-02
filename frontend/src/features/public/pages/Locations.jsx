import React from "react";
import Halls from "../../../shared/components/Halls.jsx";

const Locations = () => {
  return (
    <div className="pb-12 pt-24">
      <section className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-secondary p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.18),transparent_45%)]" />
          <div className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              Halls
            </p>
            <h1 className="text-4xl font-extrabold text-text-primary md:text-5xl">
              Locations and Cinemas
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
              Find nearby halls, check facilities, and explore maps before booking your preferred show.
            </p>
          </div>
        </div>
      </section>
      <Halls showMap />
    </div>
  );
};

export default Locations;
