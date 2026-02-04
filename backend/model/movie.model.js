import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Movie = sequelize.define(
  "Movie",
  {
    movie_title: {
      type: DataTypes.STRING(30),
      allowNull: false,
      set(value) {
        if (typeof value === "string") {
          this.setDataValue("movie_title", value.trim());
        }
      },
    },
    description: {
      type: DataTypes.TEXT,
      et(value) {
        if (typeof value === "string") {
          this.setDataValue("movie_title", value.trim());
        }
      },
    },
    genre: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isPlaying: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    playEndDate: {
      type: DataTypes.DATEONLY,
    },
    moviePoster: {
      type: DataTypes.TEXT,
    },
    movieTrailer: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "Movie",
    timestamps: true,
  },
);

export default Movie;
