import Movie from "../model/movie.model.js";
import fs from 'fs';
import path from 'path';
import { title } from "process";

const movieRegister = async (req, res) => {
    try {
        
        const { movie_title, description, genre, duration} = req.body
        if (!movie_title || !description || !genre || !duration) {
            return res.status(400).json({
                success: false,
                message: "Movie details must be filled to register"
            })
        }

        let genreArr 
        if (genre.includes(", ")) {
            genreArr = genre.split(", ")
        } else if (genre.includes(",")) {
            genreArr = genre.split(",")
        } else {
            genreArr = genre.split(" ")
        }

        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: 'Unauthorized: No user found'
            })
        }

        if (req.user.role !== 'hall-admin') {
            return res.status(403).json({
                success: false,
                message: 'Sorry, you are not authorized to register movie'
            })
        }

        const moviePoster =  req.files?.moviePoster?.[0]
        const movieTrailer = req.files?.movieTrailer?.[0]

        if (!moviePoster || !movieTrailer) {
            return res.status(400).json({
                success: false,
                message: 'Trailer and Poster are required'
            })
        }

        const date = new Date()
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 7) 

        const movie = await Movie.create({
            movie_title,
            description,
            genre: genreArr,
            duration,
            releaseDate: date.toISOString().split('T')[0],
            isPlaying: true,
            playEndDate: endDate.toISOString().split('T')[0],
            moviePoster: moviePoster.filename,
            movieTrailer: movieTrailer.filename
        })

        return res.status(201).json({
            success: true,
            message: 'Movie has been registered successfully',
            data: movie
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server failed while creating movies',
            error: err.message
        })
    }
}

const movieDelete = async (req,res) => {
    try {
        const {id} = req.params
        const movie = await Movie.findByPk(id)

        if (!movie) {
            return res.status(400).json({
                success: false,
                message: 'Delete: Movie not found'
            })
        }

        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: 'Unauthorized: No user found'
            })
        }

        if (req.user?.role !== 'hall-admin') {
            return res.status(403).json({
                success: false,
                message: 'Movie cannot be deleted: Unauthorized'
            })
        }

        await movie.destroy()

        return res.status(200).json({
            success: true,
            message: 'Movie deleted successfully',
            data: movie
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server failed while deleting movie',
            error: err.message
        })
    }
}

const movieGet = async (req,res) => {
    try {
        const movies = await Movie.findAll()
        
        return res.status(200).json({
            success: true,
            message: 'Movies fetched successfully',
            data: movies
        })
        
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server failed while fetching user',
            error: err.message
        })
    }
}

const movieUpdate = async (req, res) => {
    try {
        const {id} = req.params
        const movie = await Movie.findByPk(id)

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie cannot find'
            })
        }

        const { movie_title, description, genre, duration, releaseDate, isPlaying } = req.body
        const moviePoster = req.files?.moviePoster?.[0].filename
        const movieTrailer = req.files?.movieTrailer?.[0].filename
        let newEndDate = movie.playEndDate

        if (releaseDate) {
            newEndDate = new Date(releaseDate)
            newEndDate.setDate(newEndDate.getDate() + 7)
        }
        const updatedMovie = await movie.update(
            {
                movie_title,
                description,
                genre,
                duration,
                moviePoster,
                movieTrailer,
                releaseDate,
                isPlaying,
                playEndDate: newEndDate
            }
        )

        return res.status(200).json({
            success: true,
            message: 'Movie has been updated successfully',
            data: updatedMovie
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: 'Server failed while updating movie',
            error: err.message
        })
    }
}

export {
    movieRegister,
    movieDelete,
    movieGet,
    movieUpdate
}