import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";
import { FieldValue } from "firebase-admin/firestore";

// Function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const lat1 = coord1.latitude;
  const lon1 = coord1.longitude;
  const lat2 = coord2.latitude;
  const lon2 = coord2.longitude;

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Function to convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Controller to handle confirming payment and marking the ride as successful
export const confirmPaymentAndMarkRideAsSuccessful = async (req, res) => {
  const user = getAuth().currentUser;

  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { bookingId, amount } = req.body;

  try {
    // Check if the booking exists and driver has arrived at dropoff
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists || !bookingDoc.data().driverArrivedAtDropoff) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or driver has not arrived at dropoff location.",
      });
    }

    const booking = bookingDoc.data();

    // Check if the driver is within the specified radius of the dropoff location
    const driverDistanceFromDropoff = calculateDistance(booking.driverCurrentLocation, booking.dropOffLocation);

    if (driverDistanceFromDropoff > 7) {
      return res.status(400).json({
        success: false,
        message: "Driver is not close enough to the dropoff location to confirm payment.",
      });
    }

    // Create a new payment record
    const newPayment = {
      bookingId,
      amount,
      paymentStatus: 'completed',
      paymentType: 'cash',
      createdAt: FieldValue.serverTimestamp()
    };

    // Save the payment record
    const paymentRef = db.collection('payments').doc();
    await paymentRef.set(newPayment);

    // Update booking payment status
    await bookingRef.update({ paymentStatus: 'completed' });

    // Listen for real-time updates
    db.collection('payments').doc(paymentRef.id).onSnapshot(doc => {
      const payment = doc.data();
      if (payment && payment.paymentStatus === 'completed') {
        // Emit event to notify driver and user of the payment amount
        console.log(`Payment confirmed for booking ${bookingId} with amount ${amount}`);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Payment confirmed and ride marked as successful.",
    });
  } catch (error) {
    console.error("Error in confirming payment and marking ride as successful:", error);
    return res.status(500).json({
      success: false,
      message: "Error in confirming payment and marking ride as successful.",
      error: error.message || error,
    });
  }
};
