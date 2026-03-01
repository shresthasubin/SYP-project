import express from "express";
import {
    startConversation,
    sendMessage,
    getMessages,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start", verifyJWT, startConversation);
router.post("/:conversationId/message", verifyJWT, sendMessage);
router.get("/:conversationId/messages", verifyJWT, getMessages);

export default router;