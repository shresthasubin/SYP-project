import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Movie = sequelize.define(
    'Movie',
    {
        movie_title: {
            type: DataTypes.STRING(30),
            allowNull: false,
            set(value) {
                this.setDataValue("movie_title", value.trim())
            }
        },
        description: {
            type: DataTypes.TEXT,
            set(value) {
                this.setDataValue("description", value.trim())
            }
        },
        genre: {
            type: DataTypes.ENUM("action",
                "adventure",
                "comedy",
                "drama",
                "romance",
                "thriller",
                "horror",
                "fantasy",
                "science_fiction",
                "mystery",
                "crime",
                "animation",
                "documentary",
                "family",
                "history",
                "war"
            ),
            allowNull: false,
            defaultValue: "action"
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        releaseDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        isPlaying: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        playEndDate: {
            type: DataTypes.DATEONLY,
        },
        moviePoster: {
            type: DataTypes.TEXT
        },
        movieTrailer: {
            type: DataTypes.TEXT
        }
    },
    {
        timestamps: true
    }
) 

export default Movie