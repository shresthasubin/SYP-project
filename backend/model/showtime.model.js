import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Movie from "./movie.model.js";
import Hall from "./hall.model.js";

const Showtime = sequelize.define(
  "Showtime",
  {
    show_date: DataTypes.DATEONLY,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME,
  },
  {
    timestamps: false,
  }
);

Movie.hasMany(Showtime, { foreignKey: "movie_id" });
Hall.hasMany(Showtime, { foreignKey: "hall_id" });

Showtime.belongsTo(Movie, { foreignKey: "movie_id" });
Showtime.belongsTo(Hall, { foreignKey: "hall_id" });

export default Showtime;
