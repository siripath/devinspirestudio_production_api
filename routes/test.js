import express from "express";
import { addTest, getTestFirst, delTest,editTest } from "../controllers/testController.js";



const router = express.Router();

router.post("/addtest/", addTest);
router.post("/deltest/", delTest);
router.post("/edittest/", editTest);
router.get("/gettestfirst/", getTestFirst);

export default router;