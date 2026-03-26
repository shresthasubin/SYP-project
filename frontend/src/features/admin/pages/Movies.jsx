import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Plus, Search, Edit2, Trash2, Upload, Film, X, ImagePlus, Video, UserRound } from "lucide-react";
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

  if (castNames.length === 0) return [{ name: "", imageFile: null, existingImage: null }];

  return castNames.map((name, index) => ({
    name,
    imageFile: null,
    existingImage: castImages[index] ?? null,
  }));
};

const createEmptyCastRow = () => ({ name: "", imageFile: null, existingImage: null });

const getMediaUrl = (file) => (file ? URL.createObjectURL(file) : "");

const getServerAssetUrl = (fileName) => {
  if (!fileName) return "";
  if (/^https?:\/\//i.test(fileName)) return fileName;
  const normalized = String(fileName).replace(/^\/+/, "").replace(/^uploads\//, "");
  return `${API_SERVER_URL}/uploads/${normalized}`;
};

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMovie, setEditingMovie] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/movie/get`, { withCredentials: true });
      if (response.data.success) setMovies(response.data.data);
    } catch (err) {
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
    if (files && files[0]) setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleRemoveFile = (name) => {
    setFormData((prev) => ({ ...prev, [name]: null }));
  };

  const handleCastNameChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      castRows: prev.castRows.map((row, idx) => (idx === index ? { ...row, name: value } : row)),
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
    setFormData((prev) => ({ ...prev, castRows: [...prev.castRows, createEmptyCastRow()] }));
  };

  const removeCastRow = (index) => {
    setFormData((prev) => {
      const next = prev.castRows.filter((_, idx) => idx !== index);
      return { ...prev, castRows: next.length > 0 ? next : [createEmptyCastRow()] };
    });
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
    setError("");
    setSubmitting(false);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.movie_title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const validateStepOne = () => {
    if (!formData.movie_title.trim()) return toast.error("Movie title is required");
    if (!formData.genre.trim()) return toast.error("Genre is required");
    if (!String(formData.duration).trim()) return toast.error("Duration is required");
    if (!formData.description.trim()) return toast.error("Description is required");
    return true;
  };

  const validateStepTwo = () => {
    if (!editingMovie && !formData.moviePoster) return toast.error("Poster is required");
    if (!editingMovie && !formData.movieTrailer) return toast.error("Trailer is required");
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStepOne()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!validateStepTwo()) return;
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveMovie = async () => {
    if (currentStep !== 3) return;
    setSubmitting(true);
    setError("");

    const normalizedRows = formData.castRows
      .map((row) => ({
        name: String(row.name || "").trim(),
        imageFile: row.imageFile || null,
        existingImage: typeof row.existingImage === "string" ? row.existingImage.trim() : null,
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
    if (formData.movieTrailer) data.append("movieTrailer", formData.movieTrailer);

    try {
      if (editingMovie) {
        await axios.put(`${API_BASE_URL}/movie/update/${editingMovie.id}`, data, {
          withCredentials: true,
        });
        toast.success("Movie updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/movie/register`, data, { withCredentials: true });
        toast.success("Movie registered successfully");
      }
      setShowModal(false);
      fetchMovies();
      resetForm();
    } catch (err) {
      console.error("Movie save error", err.response || err.message);
      setError(err.response?.data?.error || err.response?.data?.message || "Operation failed");
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/movie/delete/${deleteTarget.id}`, { withCredentials: true });
      toast.success("Movie deleted successfully");
      setDeleteTarget(null);
      fetchMovies();
    } catch (err) {
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
      moviePoster: null,
      movieTrailer: null,
    });
    setShowModal(true);
  };

  const posterPreview = formData.moviePoster
    ? getMediaUrl(formData.moviePoster)
    : editingMovie?.moviePoster
      ? getServerAssetUrl(editingMovie.moviePoster)
      : "";

  const trailerPreview = formData.movieTrailer
    ? getMediaUrl(formData.movieTrailer)
    : editingMovie?.movieTrailer
      ? getServerAssetUrl(editingMovie.movieTrailer)
      : "";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Movie Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Add, edit, or remove movies from your cinema's listing.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Movie
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}>
        <TextField
          fullWidth
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <LinearProgress color="primary" />
        ) : filteredMovies.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">No movies found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Genre</TableCell>
                  <TableCell>Release Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMovies.map((movie) => (
                  <TableRow hover key={movie.id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 72,
                            height: 96,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            bgcolor: "background.default",
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {movie.moviePoster ? (
                            <img
                              src={getServerAssetUrl(movie.moviePoster)}
                              alt={movie.movie_title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Film size={20} />
                          )}
                        </Box>
                        <Box>
                          <Typography fontWeight={700}>{movie.movie_title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Director: {movie.director || "N/A"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {typeof movie.genre === "string"
                          ? movie.genre
                          : Array.isArray(movie.genre)
                            ? movie.genre.join(", ")
                            : "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {movie.releaseDate
                          ? new Date(movie.releaseDate).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {movie.playEndDate
                          ? new Date(movie.playEndDate).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={movie.isPlaying ? "Now Showing" : "Coming Soon"}
                        color={movie.isPlaying ? "success" : "warning"}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEditModal(movie)}>
                            <Edit2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget({ id: movie.id, title: movie.movie_title })}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {editingMovie ? "Edit Movie" : "Add New Movie"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {currentStep} of 3
            </Typography>
          </Box>
          <IconButton onClick={() => setShowModal(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <Divider />
        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContent dividers>
          <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Movie Details</StepLabel>
            </Step>
            <Step>
              <StepLabel>Media Uploads</StepLabel>
            </Step>
            <Step>
              <StepLabel>Team & Cast</StepLabel>
            </Step>
          </Stepper>

          {currentStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Primary Details
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add the core movie information used in listings and search.
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              label="Movie Title"
                              name="movie_title"
                              fullWidth
                              value={formData.movie_title}
                              onChange={handleInputChange}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <TextField
                              label="Genre"
                              name="genre"
                              fullWidth
                              placeholder="Action, Thriller"
                              helperText="Separate multiple genres with commas."
                              value={formData.genre}
                              onChange={handleInputChange}
                            />
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              label="Duration (mins)"
                              name="duration"
                              fullWidth
                              type="number"
                              value={formData.duration}
                              onChange={handleInputChange}
                            />
                          </Grid>
                        </Grid>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ flexGrow: 1 }}>
                    <CardContent sx={{ height: "100%" }}>
                      <Stack spacing={2.5} sx={{ height: "100%" }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Synopsis
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Write the short description that users will see on the movie page.
                          </Typography>
                        </Box>
                        <TextField
                          label="Description"
                          name="description"
                          fullWidth
                          multiline
                          minRows={10}
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Write a compelling movie summary..."
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={formData.movie_title.trim() || "Untitled movie"}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={
                            String(formData.duration).trim()
                              ? `${formData.duration} mins`
                              : "Duration pending"
                          }
                          variant="outlined"
                        />
                        <Chip
                          label={formData.genre.trim() || "Genre pending"}
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          )}

          {currentStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <ImagePlus size={18} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Poster Upload
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Upload the artwork that appears in cards, tables, and movie details.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload size={18} />}
                          fullWidth
                          sx={{ minHeight: 52, justifyContent: "flex-start" }}
                        >
                          {formData.moviePoster
                            ? formData.moviePoster.name
                            : editingMovie?.moviePoster
                              ? "Replace poster image"
                              : "Upload poster image"}
                          <input
                            type="file"
                            name="moviePoster"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                          />
                        </Button>
                        {(formData.moviePoster || editingMovie?.moviePoster) && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<X size={16} />}
                            onClick={() => handleRemoveFile("moviePoster")}
                            sx={{ minHeight: 52, minWidth: { sm: 140 } }}
                          >
                            Remove
                          </Button>
                        )}
                      </Stack>
                      {posterPreview ? (
                        <Box
                          component="img"
                          src={posterPreview}
                          alt="Poster preview"
                          sx={{
                            width: "100%",
                            height: 320,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{
                            height: 320,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderStyle: "dashed",
                            bgcolor: "background.default",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No poster selected
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Video size={18} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Trailer Upload
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Upload a preview video users can watch before booking.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload size={18} />}
                          fullWidth
                          sx={{ minHeight: 52, justifyContent: "flex-start" }}
                        >
                          {formData.movieTrailer
                            ? formData.movieTrailer.name
                            : editingMovie?.movieTrailer
                              ? "Replace trailer video"
                              : "Upload trailer video"}
                          <input
                            type="file"
                            name="movieTrailer"
                            accept="video/*"
                            hidden
                            onChange={handleFileChange}
                          />
                        </Button>
                        {(formData.movieTrailer || editingMovie?.movieTrailer) && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<X size={16} />}
                            onClick={() => handleRemoveFile("movieTrailer")}
                            sx={{ minHeight: 52, minWidth: { sm: 140 } }}
                          >
                            Remove
                          </Button>
                        )}
                      </Stack>
                      {trailerPreview ? (
                        <Box
                          component="video"
                          controls
                          src={trailerPreview}
                          sx={{
                            width: "100%",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "common.black",
                          }}
                        />
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{
                            minHeight: 180,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderStyle: "dashed",
                            bgcolor: "background.default",
                            px: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" align="center">
                            No trailer selected
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {currentStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={5}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Crew Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add the primary creative team attached to this movie.
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Director"
                            name="director"
                            fullWidth
                            value={formData.director}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Writer"
                            name="writer"
                            fullWidth
                            value={formData.writer}
                            onChange={handleInputChange}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={7}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Cast Overview
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add cast names in order. Uploaded cast images are included in the same multipart request.
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`${formData.castRows.filter((row) => String(row.name || "").trim()).length} cast entries ready`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${formData.castRows.filter((row) => row.imageFile || row.existingImage).length} images attached`}
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <UserRound size={18} />
                          <Typography fontWeight={700}>Cast Members</Typography>
                        </Stack>
                        <Button onClick={addCastRow} size="small" variant="outlined">
                          + Add Cast
                        </Button>
                      </Stack>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                          maxHeight: 520,
                          overflowY: "auto",
                          pr: 1,
                          alignItems: "stretch",
                        }}
                      >
                        {formData.castRows.map((row, index) => {
                          const castPreview = row.imageFile
                            ? getMediaUrl(row.imageFile)
                            : row.existingImage
                              ? getServerAssetUrl(row.existingImage)
                              : "";

                          return (
                            <Paper
                              variant="outlined"
                              key={`cast-row-${index}`}
                              sx={{
                                p: 2,
                                flex: "1 1 320px",
                                minWidth: { xs: "100%", sm: 320 },
                                maxWidth: { xs: "100%", md: "calc(50% - 8px)" },
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                borderRadius: 3,
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                alignItems={{ xs: "stretch", sm: "flex-start" }}
                              >
                                <Box
                                  sx={{
                                    width: { xs: "100%", sm: 120 },
                                    minWidth: { sm: 120 },
                                    height: 140,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "background.default",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {castPreview ? (
                                    <Box
                                      component="img"
                                      src={castPreview}
                                      alt={`Cast preview ${index + 1}`}
                                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      No image
                                    </Typography>
                                  )}
                                </Box>

                                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip size="small" label={`Cast ${index + 1}`} />
                                    {String(row.name || "").trim() ? (
                                      <Chip
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        label={row.name}
                                      />
                                    ) : null}
                                  </Stack>

                                  <TextField
                                    size="small"
                                    label="Cast Name"
                                    value={row.name}
                                    onChange={(e) => handleCastNameChange(index, e.target.value)}
                                    placeholder="Cast name"
                                    fullWidth
                                  />
                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      component="label"
                                      startIcon={<Upload size={14} />}
                                      sx={{ alignSelf: "flex-start" }}
                                    >
                                      {row.imageFile
                                        ? "Change Image"
                                        : row.existingImage
                                          ? "Replace Image"
                                          : "Upload Image"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => handleCastImageChange(index, e.target.files?.[0] || null)}
                                      />
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      onClick={() => removeCastRow(index)}
                                      sx={{ alignSelf: "flex-start" }}
                                    >
                                      Remove
                                    </Button>
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary">
                                    {row.imageFile
                                      ? row.imageFile.name
                                      : row.existingImage
                                        ? `Current image: ${row.existingImage}`
                                        : "No image selected"}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button variant="outlined" onClick={handleBackStep}>
              Back
            </Button>
          )}
          {currentStep < 3 ? (
            <Button variant="contained" onClick={handleNextStep} color="primary">
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSaveMovie}
              color="primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingMovie ? "Update Movie" : "Add Movie"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Movie</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              {" "}{deleteTarget?.title || "this movie"}
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Movies;
