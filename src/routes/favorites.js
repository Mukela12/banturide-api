import express from 'express';
import {
    addFavoriteLocation,
    getFavoriteLocations,
    updateFavoriteLocation,
    deleteFavoriteLocation
} from '../controllers/FavoritesController.js';

import { verifyToken } from "../middleware/index.js";

const router = express.Router();

router.use(verifyToken);

router.post('/add-favorites', addFavoriteLocation);
router.get('/get-favorites', getFavoriteLocations);  // No need for userId param, current user will be used
router.put('/update-favorites', updateFavoriteLocation);
router.delete('/favorites', deleteFavoriteLocation);

export default router;
