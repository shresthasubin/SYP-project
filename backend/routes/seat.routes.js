import express from "express";
import { createSeat, getSeatsByHall } from "../controller/seat.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createSeat);
router.get("/hall/:hallId", getSeatsByHall);

export default router;
