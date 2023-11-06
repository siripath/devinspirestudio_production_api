import express from "express";
import { addMessage, getMessages, getMessagesformodal} from "../controllers/messageController.js";


const router = express.Router();

router.post("/addmsg/", addMessage);
router.get("/getmsgformodal/:id", getMessagesformodal);
//router.post("/getmsg/", getMessages);
router.get("/getmsg/:userId", getMessages);

export default router;