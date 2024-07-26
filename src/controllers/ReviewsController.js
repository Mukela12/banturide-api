import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";
import { FieldValue } from "firebase-admin/firestore";

// Add a Review
export const addReview = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { bookingId, driverId, rating, comment } = req.body;

    if (!bookingId || !driverId || !rating) {
        return res.status(400).json({ error: "Booking ID, Driver ID, and Rating are required" });
    }

    try {
        const review = {
            userId: user.uid,
            bookingId,
            driverId,
            rating,
            comment,
            createdAt: FieldValue.serverTimestamp()
        };

        const reviewRef = db.collection('reviews').doc();
        await reviewRef.set(review);

        // Update driver's rating
        const driverRef = db.collection('drivers').doc(driverId);
        const driverDoc = await driverRef.get();

        if (!driverDoc.exists) {
            return res.status(404).json({ error: "Driver not found" });
        }

        const driverData = driverDoc.data();
        const newRating = (driverData.totalRatings * driverData.numberOfReviews + rating) / (driverData.numberOfReviews + 1);

        await driverRef.update({
            totalRatings: FieldValue.increment(rating),
            numberOfReviews: FieldValue.increment(1),
            averageRating: newRating
        });

        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get Reviews for a Driver
export const getDriverReviews = async (req, res) => {
    const { driverId } = req.params;

    if (!driverId) {
        return res.status(400).json({ error: "Driver ID is required" });
    }

    try {
        const reviewsSnapshot = await db.collection('reviews').where('driverId', '==', driverId).get();
        const reviews = [];

        reviewsSnapshot.forEach(doc => {
            reviews.push(doc.data());
        });

        res.status(200).json({ reviews });
    } catch (error) {
        console.error("Error getting driver reviews:", error);
        res.status(500).json({ error: error.message });
    }
};
