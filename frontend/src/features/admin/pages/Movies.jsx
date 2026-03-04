import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Film,
  Calendar,
  Clock,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api";

const toCastRows = (movie) => {
  const castNames = Array.isArray(movie?.casts)
    ? movie.casts
    : typeof movie?.casts === "string"
      ? movie.casts.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
  const castImages = Array.isArray(movie?.castImages) ? movie.castImages : [];

  if (castNames.length === 0) {
    return [{ name: "", imageFile: null, existingImage: null }];
  }

  return castNames.map((name, index) => ({
    name,
    imageFile: null,
    existingImage: castImages[index] ?? null,
  }));
};

const createEmptyCastRow = () => ({
  name: "",
  imageFile: null,
  existingImage: null,
});

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMovie, setEditingMovie] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    movie_title: "",
    description: "",
    director: "",
    writer: "",
    castRows: [createEmptyCastRow()],
    genre: "",
    duration: "",
    moviePoster: null,
    movieTrailer: null,
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movie/get`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setMovies(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCastNameChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      castRows: prev.castRows.map((row, idx) =>
        idx === index ? { ...row, name: value } : row,
      ),
    }));
  };

  const handleCastImageChange = (index, file) => {
    setFormData((prev) => ({
      ...prev,
      castRows: prev.castRows.map((row, idx) =>
        idx === index
          ? { ...row, imageFile: file || null, existingImage: file ? null : row.existingImage }
          : row,
      ),
    }));
  };

  const addCastRow = () => {
    setFormData((prev) => ({
      ...prev,
      castRows: [...prev.castRows, createEmptyCastRow()],
    }));
  };

  const removeCastRow = (index) => {
    setFormData((prev) => {
      const next = prev.castRows.filter((_, idx) => idx !== index);
      return {
        ...prev,
        castRows: next.length > 0 ? next : [createEmptyCastRow()],
      };
    });
  };

  const handleSaveMovie = async () => {
    if (currentStep !== 2) return;
    const normalizedRows = formData.castRows
      .map((row) => ({
        name: String(row.name || "").trim(),
        imageFile: row.imageFile || null,
        existingImage:
          typeof row.existingImage === "string" && row.existingImage.trim()
            ? row.existingImage.trim()
            : null,
      }))
      .filter((row) => row.name.length > 0);

    const castProfiles = [];
    let imageFileIndex = 0;
    const data = new FormData();
    data.append("movie_title", formData.movie_title);
    data.append("description", formData.description);
    data.append("director", formData.director);
    data.append("writer", formData.writer);
    data.append("genre", formData.genre);
    data.append("duration", formData.duration);
    normalizedRows.forEach((row) => {
      const profile = { name: row.name };
      if (row.imageFile) {
        data.append("castImages", row.imageFile);
        profile.imageFileIndex = imageFileIndex;
        imageFileIndex += 1;
      } else if (row.existingImage) {
        profile.image = row.existingImage;
      }
      castProfiles.push(profile);
    });
    data.append("castProfiles", JSON.stringify(castProfiles));
    if (formData.moviePoster) data.append("moviePoster", formData.moviePoster);
    if (formData.movieTrailer)
      data.append("movieTrailer", formData.movieTrailer);

    try {
      if (editingMovie) {
        await axios.put(
          `${API_BASE_URL}/movie/update/${editingMovie.id}`,
          data,
          {
            withCredentials: true,
          },
        );
        toast.success("Movie updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/movie/register`, data, {
          withCredentials: true,
        });
        toast.success("Movie registered successfully");
      }
      setShowModal(false);
      fetchMovies();
      resetForm();
    } catch (error) {
      console.error("Movie save error", error.response || error.message);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Operation failed",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/movie/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("Movie deleted successfully");
      fetchMovies();
    } catch (error) {
      toast.error("Failed to delete movie");
    }
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setCurrentStep(1);
    setFormData({
      movie_title: movie.movie_title,
      description: movie.description,
      director: movie.director || "",
      writer: movie.writer || "",
      castRows: toCastRows(movie),
      genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "",
      duration: movie.duration,
      moviePoster: null, // Reset files on edit
      movieTrailer: null,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      movie_title: "",
      description: "",
      director: "",
      writer: "",
      castRows: [createEmptyCastRow()],
      genre: "",
      duration: "",
      moviePoster: null,
      movieTrailer: null,
    });
    setEditingMovie(null);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.movie_title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const validateStepOne = () => {
    if (!formData.movie_title.trim()) {
      toast.error("Movie title is required");
      return false;
    }
    if (!formData.genre.trim()) {
      toast.error("Genre is required");
      return false;
    }
    if (!String(formData.duration).trim()) {
      toast.error("Duration is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (!editingMovie && !formData.moviePoster) {
      toast.error("Poster image is required for new movie");
      return false;
    }
    if (!editingMovie && !formData.movieTrailer) {
      toast.error("Trailer video is required for new movie");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStepOne()) return;
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Movie Management</h1>
          <p className="mt-1 text-slate-400">
            Add, edit, or remove movies from your cinema's listing.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#D72626] px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Add New Movie
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Movies Table */}
      <div className="rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
        {filteredMovies.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-slate-400">No movies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    TITLE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    GENRE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    RELEASE DATE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    END DATE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr
                    key={movie.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    {/* Poster & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-4 shrink-0 rounded-md bg-slate-800 overflow-hidden">
                          {movie.moviePoster ? (
                            <img
                              src={`${API_SERVER_URL}/uploads/${movie.moviePoster}`}
                              alt={movie.movie_title}
                              className="h-20 w-24 object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Film size={20} className="text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {movie.movie_title}
                          </p>
                          <p className="text-xs text-slate-400">
                            Director: {movie.director || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Genre */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {typeof movie.genre === "string"
                          ? movie.genre
                          : Array.isArray(movie.genre)
                            ? movie.genre.join(", ")
                            : "N/A"}
                      </p>
                    </td>
                  

                    {/* Release Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {movie.releaseDate
                          ? new Date(movie.releaseDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                      {/* End Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {movie.playEndDate
                          ? new Date(movie.playEndDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          movie.isPlaying
                            ? "bg-green-900/30 text-green-400"
                            : "bg-amber-900/30 text-amber-400"
                        }`}
                      >
                        {movie.isPlaying ? "Now Showing" : "Coming Soon"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(movie)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1a1a1a] p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingMovie ? "Edit Movie" : "Add New Movie"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              method="post"
              encType="multipart/form-data"
              className="space-y-6"
            >
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-xs uppercase tracking-wider">
                <span className={currentStep === 1 ? "text-[#D72626] font-semibold" : "text-slate-400"}>
                  Step 1: Movie Details
                </span>
                <span className={currentStep === 2 ? "text-[#D72626] font-semibold" : "text-slate-400"}>
                  Step 2: Team & Cast
                </span>
              </div>

              {currentStep === 1 && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Movie Title
                    </label>
                    <input
                      type="text"
                      name="movie_title"
                      value={formData.movie_title}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Genre
                    </label>
                    <input
                      type="text"
                      name="genre"
                      placeholder="Action, Thriller"
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                    <p className="text-xs text-slate-400">
                      Add multiple genres separated by commas.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Duration (mins)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="1"
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Poster Image
                    </label>
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
                        <span>
                          {formData.moviePoster
                            ? formData.moviePoster.name
                            : "Upload Poster"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Trailer Video
                    </label>
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
                        <span>
                          {formData.movieTrailer
                            ? formData.movieTrailer.name
                            : "Upload Trailer"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Director
                    </label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Writer
                    </label>
                    <input
                      type="text"
                      name="writer"
                      value={formData.writer}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">
                      Casts
                    </label>
                  <div className="space-y-3">
                      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                        {formData.castRows.map((row, index) => (
                        <div
                          key={`cast-row-${index}`}
                          className="grid gap-2 rounded-lg border border-white/10 bg-black/40 p-3 md:grid-cols-[1fr_auto_auto]"
                        >
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleCastNameChange(index, e.target.value)}
                            placeholder="Cast name"
                            className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                          />
                          <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-[#D72626]/50 hover:text-[#D72626]">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCastImageChange(index, e.target.files?.[0] || null)}
                            />
                            {row.imageFile ? "Image Selected" : row.existingImage ? "Replace Image" : "Upload Image"}
                          </label>
                          <button
                            type="button"
                            onClick={() => removeCastRow(index)}
                            className="rounded-lg border border-red-900/60 px-3 py-2 text-xs text-red-300 hover:bg-red-900/20"
                          >
                            Remove
                          </button>
                          <p className="text-xs text-slate-400 md:col-span-3">
                            {row.imageFile
                              ? row.imageFile.name
                              : row.existingImage
                                ? `Current image: ${row.existingImage}`
                                : "No image selected"}
                          </p>
                        </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addCastRow}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-[#D72626]/50 hover:text-[#D72626]"
                      >
                        + Add Cast
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-6 py-2 font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="rounded-lg border border-white/10 px-6 py-2 font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="rounded-lg bg-[#D72626] px-6 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveMovie}
                    className="rounded-lg bg-[#D72626] px-6 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
                  >
                    {editingMovie ? "Update Movie" : "Add Movie"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
