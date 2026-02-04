import express from "express";
import { sendMessage, getChat } from "../controller/chat.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/:userId", auth, getChat);

export default router;
