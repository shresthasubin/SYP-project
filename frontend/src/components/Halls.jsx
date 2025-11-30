import React from 'react';
import { MapPin, Monitor, Speaker, Armchair } from 'lucide-react';
import { motion } from 'framer-motion';
import "../index.css";
const HALLS = [
  {
    id: 1,
    name: "CineHall Downtown",
    location: "City Center Mall, 4th Floor",
    image: "https://images.unsplash.com/photo-1517604931442-71053e3e2e3c?q=80&w=2070&auto=format&fit=crop",
    features: ["IMAX", "Dolby Atmos", "Recliner Seats"]
  },
  {
    id: 2,
    name: "CineHall Westside",
    location: "Westside Plaza, Avenue 5",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
    features: ["4DX", "Laser Projection", "Gourmet Food"]
  },
  {
    id: 3,
    name: "CineHall Luxe",
    location: "The Grand Hotel, Lobby Level",
    image: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=2070&auto=format&fit=crop",
    features: ["Gold Class", "Butler Service", "Private Screening"]
  }
];

const Halls = () => {
  return (
    <section className="py-16 bg-secondary" id="locations">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <span className="text-accent">Our</span> Cinemas
          </h2>
          <p className="text-text-secondary">Experience movies at our premium locations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HALLS.map((hall, index) => (
            <motion.div 
              key={hall.id} 
              className="bg-primary rounded-xl overflow-hidden border border-white/5 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <img src={hall.image} alt={hall.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-white">{hall.name}</h3>
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                  <MapPin size={16} className="text-accent" />
                  <span>{hall.location}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {hall.features.map((feature, index) => (
                    <span key={index} className="bg-white/5 text-text-secondary px-3 py-1 rounded text-xs font-medium">{feature}</span>
                  ))}
                </div>
                <button className="w-full py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">View Shows</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Halls;
