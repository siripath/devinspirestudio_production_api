import express from "express";
import { addProducts, getProductsFirst, delProducts,editProducts } from "../controllers/productsController.js";



const router = express.Router();

router.post("/addproducts/", addProducts);
router.post("/delproducts/", delProducts);
router.post("/editproducts/", editProducts);
router.get("/getproductsfirst/", getProductsFirst);

export default router;