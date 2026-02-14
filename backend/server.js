import express from "express";
import { sequelize, conenctDB } from "./db/index.js";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "./model/user.model.js";
import Booking from "./model/booking.model.js";
import BookingSeat from "./model/bookingSeat.model.js";
import Hall from "./model/hall.model.js";
import Message from "./model/message.model.js";
import Movie from "./model/movie.model.js";
import Payment from "./model/payment.model.js";
import Seat from "./model/seat.model.js";
import Showtime from "./model/showtime.model.js";
import Hallroom from "./model/hallroom.model.js";
import Hallclass from "./model/hallclass.model.js";

dotenv.config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use("/api", router);

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      where: { email: process.env.seed_admin },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.seed_admin_pass, 10);
      await User.create({
        fullname: "Admin",
        email: process.env.seed_admin,
        password: hashedPassword,
        agreeTerm: true,
        role: "admin",
      });
      console.log(" Admin user seeded successfully");
    } else {
      console.log(" Admin user already exists");
    }
  } catch (err) {
    console.log(" Error seeding admin:", err.message);
  }
};

const startServer = async () => {
  await conenctDB();

  await sequelize.sync({ force: false });
  await seedAdmin();

  await Hallclass.findOrCreate({ where: { seatType: 'regular' }, defaults: { price: 10 } });
  await Hallclass.findOrCreate({ where: { seatType: 'premium' }, defaults: { price: 20 } });

  app.listen(port, () => {
    console.log(`App is listening at PORT: [${port}]`);
    app.get("/", (req, res) => {
      res.send("Backend is running...");
    });
  });
};

startServer();
