import express from "express";
import { login,register,getAllUsers,setAvatar,getPeople,logOut} from "../controllers/userController.js";


const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
//router.post("/logout/:id", logOut);
router.post("/logout", logOut);
router.get("/people", getPeople);


export default router;
