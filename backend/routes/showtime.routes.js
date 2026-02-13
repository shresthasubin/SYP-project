import express from "express";
import { createShowtime, getShowtimes } from "../controller/showtime.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, roleCheck(["admin"]), createShowtime);
router.get("/", getShowtimes);

export default router;
