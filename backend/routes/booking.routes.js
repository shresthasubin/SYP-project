import express from "express";
import { createBooking } from "../controller/booking.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createBooking);

export default router;
