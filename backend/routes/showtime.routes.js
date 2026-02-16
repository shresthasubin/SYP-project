import express from "express";
import { verifyJWT, roleCheck } from "../middlewares/auth.middleware.js";
import { createShowtime, deleteShowtime, getShowtimes, getShowtimesByHallroom, getShowtimesByMovie, updateShowTime } from "../controllers/showtime.controller.js";

const showtimeRoute = express.Router();

showtimeRoute.post("/create-showtime/:movieId/:hallroomId", verifyJWT, roleCheck(["admin"]), createShowtime);

showtimeRoute.put("/update-showtime/:showtimeId", verifyJWT, roleCheck(["admin"]), updateShowTime);

showtimeRoute.get("/get", getShowtimes);

showtimeRoute.get("/get/:hallroomId", getShowtimesByHallroom);

showtimeRoute.get("/get/:movieId", getShowtimesByMovie);

showtimeRoute.get("/delete/:showtimeId", deleteShowtime);

export default showtimeRoute;
