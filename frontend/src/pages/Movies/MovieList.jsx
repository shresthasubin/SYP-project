import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import MovieForm from '../../components/Movies/MovieForm';
import { fetchMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMovies();
      setMovies(data);
    } catch (error) {
      toast.error('Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovie(id);
        toast.success('Movie deleted successfully');
        loadMovies();
      } catch (error) {
        toast.error('Failed to delete movie');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMovie) {
        await updateMovie(editingMovie.id, formData);
        toast.success('Movie updated successfully');
      } else {
        await createMovie(formData);
        toast.success('Movie created successfully');
      }
      setIsFormOpen(false);
      loadMovies();
    } catch (error) {
      toast.error('Failed to save movie');
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <Layout>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h1>
        </div>
        <Card>
          <MovieForm 
            initialData={editingMovie} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
          />
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Movies</h1>
          <p className="text-gray-400 mt-1">Manage your cinema listings</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus size={20} />
          Add Movie
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text"
          placeholder="Search movies by title or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-bg border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-neon-blue outline-none transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading movies...</div>
      ) : (
        <Table headers={['Poster', 'Title', 'Genre', 'Duration', 'Release Date', 'Actions']}>
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="h-16 w-12 rounded bg-gray-800 overflow-hidden">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-white">{movie.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                    {movie.genre}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{movie.duration} min</td>
                <td className="px-6 py-4 text-gray-400">{movie.releaseDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="!p-2" onClick={() => handleEditClick(movie)}>
                      <Edit2 size={16} className="text-blue-400" />
                    </Button>
                    <Button variant="ghost" className="!p-2" onClick={() => handleDeleteClick(movie.id)}>
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                No movies found.
              </td>
            </tr>
          )}
        </Table>
      )}
    </Layout>
  );
};

export default MovieList;
