import express from 'express';
import {
    getTotalEarnings,
    updateDriverStatus,
    getDriverStatistics
} from '../controllers/DriverFeatures.js';

const router = express.Router();

router.get('/total-earnings', getTotalEarnings); // Get the total earnings of the driver
router.post('/update-status', updateDriverStatus); // Update the driver's status
router.get('/statistics', getDriverStatistics); // Get driver statistics

export default router;
