import express from "express";
import {
  cancelMyBooking,
  createTicketBooking,
  getMyTickets,
  getSeatAvailabilityForShowtime,
} from "../controllers/ticket.controller.js";
import { verifyJWT, roleCheck } from "../middlewares/auth.middleware.js";

const ticketRoute = express.Router();

ticketRoute.get("/availability/:showtimeId", getSeatAvailabilityForShowtime);
ticketRoute.post("/book/:showtimeId", [verifyJWT, roleCheck(["user", "admin", "hall-admin"])], createTicketBooking);
ticketRoute.get("/my", verifyJWT, getMyTickets);
ticketRoute.put("/cancel/:bookingId", verifyJWT, cancelMyBooking);

export default ticketRoute;
