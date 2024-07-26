import { getAuth } from "firebase/auth";
import { db, admin } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

// Helper function to get distance between two points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Helper function to send notifications
async function sendNotification(token, title, body, data) {
    const message = {
        token: token,
        notification: {
            title: title,
            body: body
        },
        data: data
    };
    await admin.messaging().send(message);
}

// Passenger Booking Request
export const PassengerBookingRequest = async (req, res) => {
    const { pickUpLatitude, pickUpLongitude, dropOffLatitude, dropOffLongitude, price, hasThirdStop, thirdStopLatitude, thirdStopLongitude } = req.body;
    const user = getAuth().currentUser;

    if (!user || !pickUpLatitude || !pickUpLongitude || !dropOffLatitude || !dropOffLongitude) {
        return res.status(400).json({
            success: false,
            message: "User, pick-up, and drop-off locations are required.",
        });
    }

    const newBooking = {
        userId: user.uid,
        pickUpLocation: { latitude: pickUpLatitude, longitude: pickUpLongitude },
        dropOffLocation: { latitude: dropOffLatitude, longitude: dropOffLongitude },
        price,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp()
    };

    if (hasThirdStop && thirdStopLatitude && thirdStopLongitude) {
        newBooking.thirdStop = { latitude: thirdStopLatitude, longitude: thirdStopLongitude };
    }

    try {
        const bookingRef = db.collection('bookings').doc();
        await bookingRef.set(newBooking);

        // Notify user about booking confirmation
        const userToken = await getUserToken(user.uid);
        await sendNotification(userToken, "Booking Request", "Your booking request has been received successfully!", { bookingId: bookingRef.id });

        return res.status(200).json({
            success: true,
            message: "Booking request received successfully!",
            booking: newBooking
        });
    } catch (error) {
        console.error("Error in booking a ride:", error);
        return res.status(500).json({
            success: false,
            message: "Error in booking a ride.",
            error: error.message || error,
        });
    }
};

// Search for Drivers
export const searchDriversForBooking = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();
        if (!bookingSnapshot.exists) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        const booking = bookingSnapshot.data();
        let searchComplete = false;

        const unsubscribe = db.collection('drivers')
            .where('status', '==', 'available')
            .onSnapshot(async snapshot => {
                if (searchComplete) {
                    unsubscribe();
                    return;
                }

                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === "added" || change.type === "modified") {
                        const driverData = change.doc.data();
                        const distance = getDistanceFromLatLonInKm(
                            booking.pickUpLocation.latitude,
                            booking.pickUpLocation.longitude,
                            driverData.location.latitude,
                            driverData.location.longitude
                        );

                        if (distance <= 5) {
                            searchComplete = true;

                            const drivers = [];
                            snapshot.forEach(doc => {
                                const driver = doc.data();
                                drivers.push({
                                    id: doc.id,
                                    ...driver
                                });
                            });

                            const userToken = await getUserToken(booking.userId);
                            await sendNotification(userToken, "Drivers Found", "Available drivers found near your location.", { bookingId: bookingId });

                            return res.status(200).json({
                                success: true,
                                message: "Drivers found",
                                drivers: drivers
                            });
                        }
                    }
                });
            });

        setTimeout(async () => {
            if (!searchComplete) {
                unsubscribe();
                const userToken = await getUserToken(booking.userId);
                await sendNotification(userToken, "No Drivers Found", "No drivers found within the time limit.", { bookingId: bookingId });
                res.status(404).json({ success: false, message: "No drivers found within the time limit." });
            }
        }, 60000);
    } catch (error) {
        console.error("Error in searching drivers for booking:", error);
        return res.status(500).json({
            success: false,
            message: "Error in processing your request.",
            error: error.message || error,
        });
    }
};

// Assign Driver to Booking
export const assignDriverToBooking = async (req, res) => {
    const { bookingId, driverId } = req.body;

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const driverRef = db.collection('drivers').doc(driverId);

        const bookingSnapshot = await bookingRef.get();
        const driverSnapshot = await driverRef.get();

        if (!bookingSnapshot.exists || !driverSnapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Booking or driver not found.",
            });
        }

        await bookingRef.update({
            driverId: driverId,
            status: 'confirmed'
        });

        await driverRef.update({
            status: 'unavailable'
        });

        // Notify user and driver about driver assignment
        const booking = bookingSnapshot.data();
        const userToken = await getUserToken(booking.userId);
        await sendNotification(userToken, "Driver Assigned", "A driver has been assigned to your booking.", { bookingId: bookingId });

        const driverToken = await getDriverToken(driverId);
        await sendNotification(driverToken, "New Booking", "You have been assigned a new booking.", { bookingId: bookingId });

        return res.status(200).json({
            success: true,
            message: "Driver selected and booking confirmed successfully!",
        });
    } catch (error) {
        console.error("Error in assigning driver to booking:", error);
        return res.status(500).json({
            success: false,
            message: "Error in assigning driver to booking.",
            error: error.message || error,
        });
    }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnapshot = await bookingRef.get();

        if (!bookingSnapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        await bookingRef.update({
            status: 'cancelled'
        });

        const booking = bookingSnapshot.data();
        if (booking.driverId) {
            const driverRef = db.collection('drivers').doc(booking.driverId);
            await driverRef.update({
                status: 'available'
            });

            // Notify driver about booking cancellation
            const driverToken = await getDriverToken(booking.driverId);
            await sendNotification(driverToken, "Booking Cancelled", "The booking has been cancelled by the user.", { bookingId: bookingId });
        }

        // Notify user about booking cancellation
        const userToken = await getUserToken(booking.userId);
        await sendNotification(userToken, "Booking Cancelled", "Your booking has been cancelled successfully.", { bookingId: bookingId });

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
        });
    } catch (error) {
        console.error("Error in cancelling booking:", error);
        return res.status(500).json({
            success: false,
            message: "Error in cancelling booking.",
            error: error.message || error,
        });
    }
};

// Driver at Pickup Location
export const driverAtPickupLocation = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnapshot = await bookingRef.get();

        if (!bookingSnapshot.exists || bookingSnapshot.data().status !== 'confirmed') {
            return res.status(404).json({
                success: false,
                message: "Invalid booking or booking not in confirmed status.",
            });
        }

        await bookingRef.update({
            driverArrivedAtPickup: true
        });

        // Notify user about driver arrival
        const booking = bookingSnapshot.data();
        const userToken = await getUserToken(booking.userId);
        await sendNotification(userToken, "Driver Arrived", "Your driver has arrived at the pickup location.", { bookingId: bookingId });

        return res.status(200).json({
            success: true,
            message: "Driver has arrived at pickup location.",
        });
    } catch (error) {
        console.error("Error in notifying driver arrival at pickup location:", error);
        return res.status(500).json({
            success: false,
            message: "Error in notifying driver arrival at pickup location.",
            error: error.message || error,
        });
    }
};

// Start Ride
export const startRide = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnapshot = await bookingRef.get();

        if (!bookingSnapshot.exists || !bookingSnapshot.data().driverArrivedAtPickup) {
            return res.status(400).json({
                success: false,
                message: "You must arrive at the pickup location before starting the ride.",
            });
        }

        await bookingRef.update({
            status: 'ongoing'
        });

        // Notify user about ride start
        const booking = bookingSnapshot.data();
        const userToken = await getUserToken(booking.userId);
        await sendNotification(userToken, "Ride Started", "Your ride has started.", { bookingId: bookingId });

        return res.status(200).json({
            success: true,
            message: "Ride has started.",
        });
    } catch (error) {
        console.error("Error in starting the ride:", error);
        return res.status(500).json({
            success: false,
            message: "Error in starting the ride.",
            error: error.message || error,
        });
    }
};

// End Ride
export const endRide = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingSnapshot = await bookingRef.get();

        if (!bookingSnapshot.exists || bookingSnapshot.data().status !== 'ongoing') {
            return res.status(400).json({
                success: false,
                message: "The ride is not ongoing or booking not found.",
            });
        }

        await bookingRef.update({
            driverArrivedAtDropoff: true,
            status: 'completed'
        });

        // Notify user about ride end
        const booking = bookingSnapshot.data();
        const userToken = await getUserToken(booking.userId);
        await sendNotification(userToken, "Ride Completed", "Your ride has been completed successfully.", { bookingId: bookingId });

        return res.status(200).json({
            success: true,
            message: "Ride has ended.",
        });
    } catch (error) {
        console.error("Error in ending the ride:", error);
        return res.status(500).json({
            success: false,
            message: "Error in ending the ride.",
            error: error.message || error,
        });
    }
};

// Helper functions to get tokens
async function getUserToken(userId) {
    const userSnapshot = await db.collection('users').doc(userId).get();
    return userSnapshot.data().fcmToken;
}

async function getDriverToken(driverId) {
    const driverSnapshot = await db.collection('drivers').doc(driverId).get();
    return driverSnapshot.data().fcmToken;
}
