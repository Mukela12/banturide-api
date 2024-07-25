import express from 'express';

import { registerDriverController, registerPassengerController, signinDriverController, signinPassengerController, signoutDriverController, signoutPassengerController } from '../controllers/authController.js';

const router = express.Router();

// passenger routes

router.post("/create-passenger", registerPassengerController);

router.post("/passenger-signin", signinPassengerController);

router.post("/passenger-signout", signoutPassengerController);

// driver routes

router.post("/create-driver", registerDriverController);

router.post("/driver-signin", signinDriverController);

router.post("/driver-signout", signoutDriverController);

export default router;