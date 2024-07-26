import { db, admin } from "../config/firebase.js";
import { getAuth } from "firebase/auth";
import cloudinary from '../helpers/cloudinaryConfig.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('avatar');

// Get user profile
export const getUserProfile = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(userDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        try {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, { public_id: `profile_${user.uid}` });
            await db.collection('users').doc(user.uid).update({ avatar: uploadResponse.secure_url });

            const updatedUserDoc = await db.collection('users').doc(user.uid).get();
            res.status(200).json(updatedUserDoc.data());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

// Remove profile picture
export const removeProfilePicture = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists || !userDoc.data().avatar) {
            return res.status(400).json({ error: "No profile picture to remove" });
        }

        const publicId = userDoc.data().avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);

        await db.collection('users').doc(user.uid).update({ avatar: null });

        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit user's name
export const editUserName = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { firstname, lastname } = req.body;

    try {
        await db.collection('users').doc(user.uid).update({ firstname, lastname });
        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit user's email
export const editUserEmail = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { email } = req.body;

    try {
        await user.updateEmail(email);
        await db.collection('users').doc(user.uid).update({ email });
        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle notifications for user
export const toggleNotifications = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { value } = req.body;

    try {
        await db.collection('users').doc(user.uid).update({ notificationsEnabled: value });
        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle driver should call
export const toggleDriverShouldCall = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { value } = req.body;

    try {
        await db.collection('users').doc(user.uid).update({ driverShouldCall: value });
        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get ride history
export const getRideHistory = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const bookingsSnapshot = await db.collection('bookings').where('userId', '==', user.uid).get();
        const bookings = bookingsSnapshot.docs.map(doc => doc.data());
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// File a complaint
export const fileComplaint = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { complaintText } = req.body;

    try {
        await db.collection('users').doc(user.uid).update({
            complaints: admin.firestore.FieldValue.arrayUnion({
                complaintText,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            })
        });
        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data().complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle referrals
export const handleReferral = async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { referralCode } = req.body;

    try {
        await db.collection('users').doc(user.uid).update({
            referrals: admin.firestore.FieldValue.arrayUnion({
                referralCode,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            })
        });
        const updatedUserDoc = await db.collection('users').doc(user.uid).get();
        res.status(200).json(updatedUserDoc.data().referrals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
