import express from 'express';
import { updateDriverLocation, updateFCMToken } from '../controllers/DriverLocationController.js';

const router = express.Router();

router.post('/update-location', updateDriverLocation); // Update driver location
router.post('/update-fcm-token', updateFCMToken); // Update FCM token

export default router;
