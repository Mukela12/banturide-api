import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";

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
    } catch (error) {
        console.error("Error updating driver location:", error);
        res.status(500).json({ error: error.message });
    }
};
