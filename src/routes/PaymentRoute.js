import express from "express";
import { confirmPaymentAndMarkRideAsSuccessful } from "../controllers/PaymentController.js";

import { verifyToken } from "./middleware/index.js";

const router = express.Router();

router.use(verifyToken);

router.post("/confirm-payment", confirmPaymentAndMarkRideAsSuccessful);

export default router;
