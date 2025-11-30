import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Film, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    movie_title: '',
    description: '',
    genre: '',
    duration: '',
    moviePoster: null,
    movieTrailer: null
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/movie/get');
      if (response.data.success) {
        setMovies(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('movie_title', formData.movie_title);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    data.append('duration', formData.duration);
    if (formData.moviePoster) data.append('moviePoster', formData.moviePoster);
    if (formData.movieTrailer) data.append('movieTrailer', formData.movieTrailer);

    try {
      if (editingMovie) {
        await axios.put(`http://localhost:3000/api/movie/update/${editingMovie.id}`, data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Movie updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/movie/register', data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Movie registered successfully');
      }
      setShowModal(false);
      fetchMovies();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/movie/delete/${id}`, {
        withCredentials: true
      });
      toast.success('Movie deleted successfully');
      fetchMovies();
    } catch (error) {
      toast.error('Failed to delete movie');
    }
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      movie_title: movie.movie_title,
      description: movie.description,
      genre: movie.genre,
      duration: movie.duration,
      moviePoster: null, // Reset files on edit
      movieTrailer: null
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      movie_title: '',
      description: '',
      genre: '',
      duration: '',
      moviePoster: null,
      movieTrailer: null
    });
    setEditingMovie(null);
  };

  const filteredMovies = movies.filter(movie => 
    movie.movie_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Movies</h1>
          <p className="mt-2 text-slate-400">Manage your movie catalog</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#D72626] px-4 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
        >
          <Plus size={20} />
          Add Movie
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl bg-black border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#D72626] focus:outline-none"
        />
      </div>

      {/* Movies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMovies.map((movie) => (
          <div key={movie.id} className="group relative overflow-hidden rounded-xl bg-black border border-white/10 transition-all hover:border-[#D72626]/50">
            <div className="aspect-[2/3] w-full bg-slate-800 relative">
              {movie.moviePoster ? (
                <img 
                  src={`http://localhost:3000/uploads/${movie.moviePoster}`} 
                  alt={movie.movie_title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Film size={48} className="text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                <button 
                  onClick={() => openEditModal(movie)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(movie.id)}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-white truncate">{movie.movie_title}</h3>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {movie.duration}m
                </span>
                <span className="truncate">{movie.genre}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1a1a1a] p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Movie Title</label>
                  <input
                    type="text"
                    name="movie_title"
                    value={formData.movie_title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Duration (mins)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="1"
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Poster Image</label>
                  <div className="relative">
                    <input
                      type="file"
                      name="moviePoster"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="poster-upload"
                    />
                    <label
                      htmlFor="poster-upload"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 bg-black/50 p-4 text-slate-400 hover:border-[#D72626]/50 hover:text-[#D72626] transition-colors"
                    >
                      <Upload size={20} />
                      <span>{formData.moviePoster ? formData.moviePoster.name : 'Upload Poster'}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Trailer Video</label>
                  <div className="relative">
                    <input
                      type="file"
                      name="movieTrailer"
                      onChange={handleFileChange}
                      accept="video/*"
                      className="hidden"
                      id="trailer-upload"
                    />
                    <label
                      htmlFor="trailer-upload"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 bg-black/50 p-4 text-slate-400 hover:border-[#D72626]/50 hover:text-[#D72626] transition-colors"
                    >
                      <Upload size={20} />
                      <span>{formData.movieTrailer ? formData.movieTrailer.name : 'Upload Trailer'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-6 py-2 font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D72626] px-6 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
                >
                  {editingMovie ? 'Update Movie' : 'Add Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
