// Update adminRoutes.js

import express from "express";
import { 
    approveDriverApplication, 
    denyDriverApplication, 
    getAllComplaints, 
    getAllDriverApplications,
    createAdmin,
    loginAdmin,
    getDriverApplicationById,
    getAllChildPickupApplications,
    approveChildPickupApplication,
    denyChildPickupApplication,
    getChildPickupApplicationById // New import
} from "../controllers/adminController.js";

const router = express.Router();

// Admin creation and login routes
router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin);

// Driver applications and complaints routes
router.get("/get-driver-applications", getAllDriverApplications);
router.get("/get-complaints", getAllComplaints);
router.get("/get-driver-application/:id", getDriverApplicationById);
router.post("/approve-driver-application", approveDriverApplication); 
router.post("/deny-driver-application", denyDriverApplication);

// Child pickup application routes
router.get("/get-child-pickup-applications", getAllChildPickupApplications);
router.get("/get-child-pickup-application/:id", getChildPickupApplicationById); // New route
router.post("/approve-child-pickup-application", approveChildPickupApplication);
router.post("/deny-child-pickup-application", denyChildPickupApplication);

export default router;