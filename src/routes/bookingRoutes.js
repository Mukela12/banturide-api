import express from "express";
import {
  PassengerBookingRequest,
  cancelBooking,
  requestDriverCancellation,
  driverAtPickupLocation,
  startRide,
  endRide,
  searchDriversForBooking,
  assignDriverToBooking
} from "../controllers/bookingController.js";

const router = express.Router();

// User post routes
router.post("/book-request", PassengerBookingRequest);
router.post("/cancel-booking", cancelBooking);
router.post("/search-driver", searchDriversForBooking);
router.post("/select-driver", assignDriverToBooking);

// Driver post routes
router.post("/driver-at-pickup-location", driverAtPickupLocation);
router.post("/start-ride", startRide);
router.post("/end-ride", endRide);

export default router;