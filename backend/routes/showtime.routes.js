import express from "express";
import { createShowtime, getShowtimes } from "../controller/showtime.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createShowtime);
router.get("/", getShowtimes);

export default router;
