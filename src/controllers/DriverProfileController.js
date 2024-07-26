import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";

// Edit driver profile
export const editDriverProfile = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, dob, email, phoneNumber, nrcNumber, address, vehicleInfo } = req.body;
    const driverRef = db.collection('drivers').doc(user.uid);

    try {
        await driverRef.update({
            firstName,
            lastName,
            dob,
            email,
            phoneNumber,
            nrcNumber,
            address,
            vehicleInfo
        });
        const updatedDriver = await driverRef.get();
        res.status(200).json(updatedDriver.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle driver availability
export const toggleDriverAvailability = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const driverRef = db.collection('drivers').doc(user.uid);

    try {
        const doc = await driverRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Driver not found" });
        }
        const currentStatus = doc.data().driverStatus;
        await driverRef.update({
            driverStatus: currentStatus === 'available' ? 'unavailable' : 'available'
        });
        const updatedDoc = await driverRef.get();
        res.status(200).json(updatedDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all driver information
export const getDriverInfo = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const driverRef = db.collection('drivers').doc(user.uid);

    try {
        const doc = await driverRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Driver not found" });
        }
        res.status(200).json(doc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
