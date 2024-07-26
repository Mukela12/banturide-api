import express from 'express';
import { addReview, getDriverReviews } from '../controllers/ReviewsController.js';
import { verifyToken } from "./middleware/index.js";

const router = express.Router();

router.use(verifyToken);

router.post('/add', addReview); // Add a new review
router.get('/driver/:driverId', getDriverReviews); // Get reviews for a specific driver

export default router;
