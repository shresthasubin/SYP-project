import Movie from "../model/movie.model.js";

const parseListField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const movieRegister = async (req, res) => {
  try {
    const {
      movie_title,
      description,
      genre,
      duration,
      director,
      writer,
      casts,
    } = req.body;
    if (!movie_title || !description || !genre || !duration) {
      return res.status(400).json({
        success: false,
        message: "Movie details must be filled to register",
      });
    }

    const genreArr = parseListField(genre);
    const castsArr = parseListField(casts);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized: No user found",
      });
    }

    if (req.user.role !== "hall-admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Sorry, you are not authorized to register movie",
      });
    }

    const moviePoster = req.files?.moviePoster?.[0];
    const movieTrailer = req.files?.movieTrailer?.[0];

    if (!moviePoster || !movieTrailer) {
      return res.status(400).json({
        success: false,
        message: "Trailer and Poster are required",
      });
    }

    const date = new Date();
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 7);

    const movie = await Movie.create({
      movie_title,
      description,
      genre: genreArr,
      duration,
      director: typeof director === "string" ? director.trim() : null,
      writer: typeof writer === "string" ? writer.trim() : null,
      casts: castsArr,
      releaseDate: date.toISOString().split("T")[0],
      isPlaying: true,
      playEndDate: endDate.toISOString().split("T")[0],
      moviePoster: moviePoster.filename,
      movieTrailer: movieTrailer.filename,
    });

    return res.status(201).json({
      success: true,
      message: "Movie has been registered successfully",
      data: movie,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while creating movies",
      error: err.message,
    });
  }
};

const movieDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Delete: Movie not found",
      });
    }

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized: No user found",
      });
    }

    if (req.user?.role !== "hall-admin" && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Movie cannot be deleted: Unauthorized",
      });
    }

    await movie.destroy();

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      data: movie,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while deleting movie",
      error: err.message,
    });
  }
};

const movieGet = async (req, res) => {
  try {
    const movies = await Movie.findAll();

    return res.status(200).json({
      success: true,
      message: "Movies fetched successfully",
      data: movies,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while fetching user",
      error: err.message,
    });
  }
};

const movieGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie fetched successfully",
      data: movie,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while fetching movie",
      error: err.message,
    });
  }
};

const movieUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie cannot find",
      });
    }

    const {
      movie_title,
      description,
      genre,
      duration,
      director,
      writer,
      casts,
      releaseDate,
      isPlaying,
    } = req.body;
    const moviePoster = req.files?.moviePoster?.[0]?.filename;
    const movieTrailer = req.files?.movieTrailer?.[0]?.filename;
    let newEndDate = movie.playEndDate;

    if (releaseDate) {
      newEndDate = new Date(releaseDate);
      newEndDate.setDate(newEndDate.getDate() + 7);
    }

    const parsedGenre = genre === undefined ? movie.genre : parseListField(genre);
    const parsedCasts = casts === undefined ? movie.casts : parseListField(casts);

    const updatedMovie = await movie.update({
      movie_title: movie_title ?? movie.movie_title,
      description: description ?? movie.description,
      genre: parsedGenre,
      duration: duration ?? movie.duration,
      director:
        director === undefined ? movie.director : typeof director === "string" ? director.trim() : movie.director,
      writer:
        writer === undefined ? movie.writer : typeof writer === "string" ? writer.trim() : movie.writer,
      casts: parsedCasts,
      moviePoster: moviePoster ?? movie.moviePoster,
      movieTrailer: movieTrailer ?? movie.movieTrailer,
      releaseDate: releaseDate ?? movie.releaseDate,
      isPlaying: isPlaying ?? movie.isPlaying,
      playEndDate: newEndDate,
    });

    return res.status(200).json({
      success: true,
      message: "Movie has been updated successfully",
      data: updatedMovie,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server failed while updating movie",
      error: err.message,
    });
  }
};

export { movieRegister, movieDelete, movieGet, movieGetById, movieUpdate };
