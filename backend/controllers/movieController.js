// Mock Data
let movies = [
  {
    id: '1',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
    genre: 'Sci-Fi',
    duration: 148,
    releaseDate: '2010-07-16',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7admal4zl67YrxIo16EO00ww.jpg',
  },
  {
    id: '2',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.',
    genre: 'Action',
    duration: 152,
    releaseDate: '2008-07-18',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  }
];

export const getMovies = (req, res) => {
  res.status(200).json(movies);
};

export const getMovieById = (req, res) => {
  const movie = movies.find((m) => m.id === req.params.id);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
};

export const createMovie = (req, res) => {
  const { title, description, genre, duration, releaseDate, poster } = req.body;
  const newMovie = {
    id: Date.now().toString(),
    title,
    description,
    genre,
    duration,
    releaseDate,
    poster,
  };
  movies.push(newMovie);
  res.status(201).json(newMovie);
};

export const updateMovie = (req, res) => {
  const { id } = req.params;
  const { title, description, genre, duration, releaseDate, poster } = req.body;
  
  const index = movies.findIndex((m) => m.id === id);
  if (index !== -1) {
    movies[index] = { ...movies[index], title, description, genre, duration, releaseDate, poster };
    res.status(200).json(movies[index]);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
};

export const deleteMovie = (req, res) => {
  const { id } = req.params;
  const index = movies.findIndex((m) => m.id === id);
  if (index !== -1) {
    movies = movies.filter((m) => m.id !== id);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
};
