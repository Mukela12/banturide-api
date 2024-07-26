import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";
import { FieldValue } from "firebase-admin/firestore";

// Update driver location
export const updateDriverLocation = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { latitude, longitude } = req.body;

    try {
        const driverRef = db.collection('drivers').doc(user.uid);

        await driverRef.update({
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            updatedAt: FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: "Location updated successfully" });

        // Listen for real-time updates on the driver's bookings
        listenForBookingAssignments(user.uid);
    } catch (error) {
        console.error("Error updating driver location:", error);
        res.status(500).json({ error: error.message });
    }
};

// Listen for real-time booking assignments
const listenForBookingAssignments = (driverId) => {
    const bookingQuery = db.collection('bookings').where('driverId', '==', driverId);

    bookingQuery.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
                const booking = change.doc.data();
                if (booking.status === 'confirmed') {
                    notifyDriverOfAssignment(driverId, booking);
                }
            }
        });
    });
};

// Notify the driver of a new booking assignment
const notifyDriverOfAssignment = async (driverId, booking) => {
    const driverRef = db.collection('drivers').doc(driverId);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
        console.error(`Driver with ID ${driverId} not found.`);
        return;
    }

    const driverData = driverDoc.data();
    const userToken = driverData.fcmToken;

    if (userToken) {
        const message = {
            token: userToken,
            notification: {
                title: "New Booking Assigned",
                body: `You have been assigned a new booking from ${booking.pickUpLocation.latitude}, ${booking.pickUpLocation.longitude} to ${booking.dropOffLocation.latitude}, ${booking.dropOffLocation.longitude}.`
            },
            data: {
                bookingId: booking.bookingId,
                pickUpLatitude: booking.pickUpLocation.latitude.toString(),
                pickUpLongitude: booking.pickUpLocation.longitude.toString(),
                dropOffLatitude: booking.dropOffLocation.latitude.toString(),
                dropOffLongitude: booking.dropOffLocation.longitude.toString()
            }
        };

        try {
            await admin.messaging().send(message);
            console.log('Driver notified of new booking assignment.');
        } catch (error) {
            console.error('Error sending notification to driver:', error);
        }
    } else {
        console.error(`No FCM token found for driver with ID ${driverId}.`);
    }
};

// Update FCM Token
export const updateFCMToken = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { fcmToken } = req.body;

    try {
        const driverRef = db.collection('drivers').doc(user.uid);
        await driverRef.update({ fcmToken });

        res.status(200).json({ message: "FCM token updated successfully" });
    } catch (error) {
        console.error("Error updating FCM token:", error);
        res.status(500).json({ error: error.message });
    }
};
