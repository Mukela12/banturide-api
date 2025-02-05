import { db } from "../config/firebase.js";
import { getAuth } from "firebase/auth";
import { FieldValue } from "firebase-admin/firestore";

// Add a new favorite location (home, work, other)
export const addFavoriteLocation = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { type, address, name } = req.body;

    try {
        const favoriteLocation = {
            userId: user.uid,
            type,
            address,
            name,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const favoriteRef = db.collection('favoriteLocations').doc();
        await favoriteRef.set(favoriteLocation);

        res.status(201).json({ id: favoriteRef.id, ...favoriteLocation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get favorite locations for a user
export const getFavoriteLocations = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const favoriteLocationsSnapshot = await db.collection('favoriteLocations').where('userId', '==', user.uid).get();
        const favoriteLocations = favoriteLocationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(favoriteLocations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a favorite location
export const updateFavoriteLocation = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { id, address, name } = req.body;

    try {
        const favoriteRef = db.collection('favoriteLocations').doc(id);
        const favoriteDoc = await favoriteRef.get();

        if (!favoriteDoc.exists) {
            return res.status(404).json({ error: 'Favorite location not found' });
        }

        await favoriteRef.update({
            address,
            name,
            updatedAt: FieldValue.serverTimestamp()
        });

        const updatedFavoriteDoc = await favoriteRef.get();
        res.status(200).json(updatedFavoriteDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a favorite location
export const deleteFavoriteLocation = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.body;

    try {
        const favoriteRef = db.collection('favoriteLocations').doc(id);
        const favoriteDoc = await favoriteRef.get();

        if (!favoriteDoc.exists) {
            return res.status(404).json({ error: 'Favorite location not found' });
        }

        await favoriteRef.delete();
        res.status(200).json({ message: 'Favorite location deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
