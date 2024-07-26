import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";


// Get Total Earnings
export const getTotalEarnings = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const bookingsSnapshot = await db.collection('bookings').where('driverId', '==', user.uid).get();
        let totalEarnings = 0;

        bookingsSnapshot.forEach(doc => {
            const booking = doc.data();
            if (booking.paymentStatus === 'completed') {
                totalEarnings += booking.price;
            }
        });

        res.status(200).json({ totalEarnings });
    } catch (error) {
        console.error("Error getting total earnings:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update Driver Status (e.g., set status to 'online' or 'offline')
export const updateDriverStatus = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { status } = req.body;

    try {
        const driverRef = db.collection('drivers').doc(user.uid);
        await driverRef.update({
            status: status
        });

        res.status(200).json({ message: "Driver status updated successfully" });
    } catch (error) {
        console.error("Error updating driver status:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get Driver Statistics
export const getDriverStatistics = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const driverRef = db.collection('drivers').doc(user.uid);
        const driverDoc = await driverRef.get();

        if (!driverDoc.exists) {
            return res.status(404).json({ error: "Driver not found" });
        }

        const driverData = driverDoc.data();
        const totalEarnings = await getTotalEarnings({ currentUser: user }, res);
        const completedRides = await db.collection('bookings').where('driverId', '==', user.uid).where('status', '==', 'completed').get();

        const statistics = {
            totalEarnings: totalEarnings.totalEarnings,
            rewardPoints: driverData.rewardPoints || 0,
            completedRides: completedRides.size,
        };

        res.status(200).json(statistics);
    } catch (error) {
        console.error("Error getting driver statistics:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function for getting total earnings (used internally)
const getTotalEarnings = async (req, res) => {
    const user = req.currentUser;

    try {
        const bookingsSnapshot = await db.collection('bookings').where('driverId', '==', user.uid).get();
        let totalEarnings = 0;

        bookingsSnapshot.forEach(doc => {
            const booking = doc.data();
            if (booking.paymentStatus === 'completed') {
                totalEarnings += booking.price;
            }
        });

        return { totalEarnings };
    } catch (error) {
        console.error("Error getting total earnings:", error);
        throw new Error(error.message);
    }
};
