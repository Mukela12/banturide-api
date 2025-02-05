import express from 'express';
import {
    getUserProfile,
    editUserName,
    editUserEmail,
    uploadProfilePicture,
    removeProfilePicture,
    toggleNotifications,
    toggleDriverShouldCall,
    getRideHistory,
    fileComplaint,
    handleReferral
} from '../controllers/ProfileControllerUSER.js';

import {
    editDriverProfile,
    toggleDriverAvailability,
    getDriverInfo
} from '../controllers/DriverProfileController.js';

import { verifyToken } from "../middleware/index.js";


const router = express.Router();


router.use(verifyToken);


// Define routes USERS
router.get('/profile', getUserProfile); // Changed to use the current user
router.post('/profile/name', editUserName);
router.post('/profile/email', editUserEmail);
router.post('/profile/upload', uploadProfilePicture);
router.delete('/profile/remove', removeProfilePicture);
router.post('/toggle-notifications', toggleNotifications);
router.post('/toggle-driver-should-call', toggleDriverShouldCall);
router.get('/ride-history', getRideHistory);
router.post('/complaint', fileComplaint);
router.post('/referral', handleReferral);

// Define routes DRIVERS
router.put('/edit', editDriverProfile); // Changed to use the current user
router.post('/toggle-availability', toggleDriverAvailability); // Changed to use the current user
router.get('/info', getDriverInfo); // Changed to use the current user

export default router;
