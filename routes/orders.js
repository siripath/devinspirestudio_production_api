import express from "express";
import { addOrder, addOrderDetails, getOrder, getOrderformodal, getOrderNo, getAllOrders} from "../controllers/orderController.js";


const router = express.Router();

router.post("/addorder/", addOrder);
router.post("/addorderdetails/", addOrderDetails);
router.get("/getorderformodal/:id", getOrderformodal);
//router.post("/getmsg/", getMessages);
router.get("/getorder/:orderno", getOrder);
router.get("/getorderno", getOrderNo);//ไปดึงเอาเลขที่สั่งซื้อล้าสุดมาเพื่อจะไปทำการรัน Orderno
router.get("/getallorders/", getAllOrders);

export default router;