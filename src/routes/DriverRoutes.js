import express from 'express';
import { updateDriverLocation, updateFCMToken } from '../controllers/DriverLocationController.js';
import { verifyToken } from "../middleware/index.js";

const router = express.Router();

router.use(verifyToken);

router.post('/update-location', updateDriverLocation); // Update driver location
router.post('/update-fcm-token', updateFCMToken); // Update FCM token

export default router;
