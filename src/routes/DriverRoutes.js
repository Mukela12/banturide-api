import express from 'express';
import { updateDriverLocation } from '../controllers/DriverLocationController.js';

const router = express.Router();

router.post('/update-location', updateDriverLocation); // New route to update driver location

export default router;
