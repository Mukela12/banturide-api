import { FieldValue } from "firebase-admin/firestore";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { db } from "../config/firebase.js";
import { sendDataToClient } from "../../server.js";


// Admin login
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        // Check if the admin exists
        const adminSnapshot = await db.collection('admins').where('email', '==', email).get();
        if (adminSnapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const adminDoc = adminSnapshot.docs[0];
        const admin = adminDoc.data();

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: adminDoc.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get driver application by ID
export const getDriverApplicationById = async (req, res) => {
    const { id } = req.params; // Get the application ID from the request parameters

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Application ID is required"
        });
    }

    try {
        const applicationDoc = await db.collection('driver-applications').doc(id).get();

        if (!applicationDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Driver application not found"
            });
        }

        const applicationData = {
            id: applicationDoc.id,
            ...applicationDoc.data()
        };

        return res.status(200).json(applicationData); // Simplified response
    } catch (error) {
        console.error("Error fetching driver application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Create an admin user
export const createAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        // Check if admin already exists
        const adminSnapshot = await db.collection('admins').where('email', '==', email).get();
        if (!adminSnapshot.empty) {
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exists"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store admin in Firestore
        await db.collection('admins').add({
            email,
            password: hashedPassword,
            createdAt: FieldValue.serverTimestamp()
        });

        return res.status(201).json({
            success: true,
            message: "Admin created successfully"
        });

    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getAllDriverApplications = async (req, res) => {
    try {
        // Get all driver applications
        const applicationsSnapshot = await db.collection('driver-applications').get();
        
        if (applicationsSnapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "No driver applications found"
            });
        }

        // Map applications and extract unique driver IDs
        const applications = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Extract unique driver IDs
        const driverIds = [...new Set(applications.map(app => app.driverId).filter(Boolean))];

        // Fetch all drivers in batch
        const driversMap = new Map();
        
        if (driverIds.length > 0) {
            // Firestore 'in' queries are limited to 10 items, so we need to batch them
            const batchSize = 10;
            const driverBatches = [];
            
            for (let i = 0; i < driverIds.length; i += batchSize) {
                const batch = driverIds.slice(i, i + batchSize);
                driverBatches.push(batch);
            }

            // Execute all batches in parallel
            const driverPromises = driverBatches.map(batch => 
                db.collection('drivers').where('uid', 'in', batch).get()
            );

            const driverSnapshots = await Promise.all(driverPromises);

            // Build the drivers map
            driverSnapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    const driverData = doc.data();
                    driversMap.set(driverData.uid || doc.id, {
                        fullName: driverData.fullName || 'Unknown Driver',
                        phoneNumber: driverData.phoneNumber || null,
                        driverRating: driverData.driverRating || null,
                        driverStatus: driverData.driverStatus || null
                    });
                });
            });
        }

        // Combine applications with driver information
        const applicationsWithDriverNames = applications.map(application => ({
            ...application,
            driverFullName: driversMap.get(application.driverId)?.fullName || 'Unknown Driver',
            driverPhoneNumber: driversMap.get(application.driverId)?.phoneNumber || null,
            driverRating: driversMap.get(application.driverId)?.driverRating || null,
            driverStatus: driversMap.get(application.driverId)?.driverStatus || null
        }));

        return res.status(200).json({
            success: true,
            applications: applicationsWithDriverNames
        });

    } catch (error) {
        console.error("Error fetching driver applications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getAllComplaints = async (req, res) => {
    try {
        const complaintsSnapshot = await db.collection('complaints').get();
        
        if (complaintsSnapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "No complaints found"
            });
        }

        const complaints = complaintsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({
            success: true,
            complaints
        });

    } catch (error) {
        console.error("Error fetching complaints:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const approveDriverApplication = async (req, res) => {
    const { applicationId, driverId, bookingClass = [], deliveryClass = [] } = req.body;

    if (!applicationId || !driverId) {
        return res.status(400).json({
            success: false,
            message: "Driver id and application id are required"
        });
    }

    try {
        await db.runTransaction(async (transaction) => {
            // Perform all reads first
            const applicationRef = db.collection('driver-applications').doc(applicationId);
            const driverRef = db.collection('drivers').doc(driverId);

            const [applicationDoc, driverDoc] = await Promise.all([
                transaction.get(applicationRef),
                transaction.get(driverRef)
            ]);

            // Validate the reads
            if (!applicationDoc.exists) {
                throw new Error("Driver application not found");
            }

            if (!driverDoc.exists) {
                throw new Error("Driver not found");
            }

            const driverUpdateData = {
                driverVerificationStatus: 'approved',
                reason: ""
            };

            if (bookingClass) {
                driverUpdateData.bookingClass = Array.isArray(bookingClass) ? bookingClass : [];
            }
            if (deliveryClass) {
                driverUpdateData.deliveryClass = Array.isArray(deliveryClass) ? deliveryClass : [];
            }

            transaction.update(applicationRef, {
                driverVerificationStatus: 'approved'
            });
            transaction.update(driverRef, driverUpdateData);
        });

        return res.status(200).json({
            success: true,
            message: "Driver application approved",
            driverId
        });

    } catch (error) {
        console.error("Error approving driver application:", error);
        const statusCode = error.message.includes("not found") ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const denyDriverApplication = async (req, res) => {
    const { driverId, applicationId, reason } = req.body;

    if (!driverId || !applicationId || !reason) {
        return res.status(400).json({
            success: false,
            message: "Driver id, application id and reason are required"
        });
    }

    try {
        await db.runTransaction(async (transaction) => {
            const applicationRef = db.collection('driver-applications').doc(applicationId);
            const driverRef = db.collection('drivers').doc(driverId);

            const [applicationDoc, driverDoc] = await Promise.all([
                transaction.get(applicationRef),
                transaction.get(driverRef)
            ]);

            if (!applicationDoc.exists) {
                throw new Error("Driver application not found");
            }

            if (!driverDoc.exists) {
                throw new Error("Driver not found");
            }

            const updateData = {
                driverVerificationStatus: 'denied', // Change from 'failed' to 'denied'
                reason
            };

            transaction.update(applicationRef, updateData);
            transaction.update(driverRef, updateData);
        });

        return res.status(200).json({
            success: true,
            message: "Driver application denied",
            driverId
        });

    } catch (error) {
        console.error("Error denying driver application:", error);
        const statusCode = error.message.includes("not found") ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Add to adminController.js

export const getChildPickupApplicationById = async (req, res) => {
    const { id } = req.params; // Get the application ID from the request parameters

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Application ID is required"
        });
    }

    try {
        const applicationDoc = await db.collection('child-pickup-applications').doc(id).get();

        if (!applicationDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Child pickup application not found"
            });
        }

        const applicationData = {
            id: applicationDoc.id,
            ...applicationDoc.data()
        };

        return res.status(200).json({
            success: true,
            application: applicationData
        });

    } catch (error) {
        console.error("Error fetching child pickup application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Approve a child pickup application
export const approveChildPickupApplication = async (req, res) => {
    const { applicationId, driverId } = req.body;

    if (!applicationId || !driverId) {
        return res.status(400).json({
            success: false,
            message: "Application ID and driver ID are required"
        });
    }

    try {
        await db.runTransaction(async (transaction) => {
            const applicationRef = db.collection('child-pickup-applications').doc(applicationId);
            const driverRef = db.collection('drivers').doc(driverId);

            const [applicationDoc, driverDoc] = await Promise.all([
                transaction.get(applicationRef),
                transaction.get(driverRef)
            ]);

            if (!applicationDoc.exists) {
                throw new Error("Child pickup application not found");
            }

            if (!driverDoc.exists) {
                throw new Error("Driver not found");
            }

            transaction.update(applicationRef, {
                childPickUpStatus: 'approved',
                childPickUpDenialReason: "",
                updatedAt: FieldValue.serverTimestamp()
            });

            transaction.update(driverRef, {
                childPickUpStatus: 'approved',
                childPickUpDenialReason: ""
            });
        });

        return res.status(200).json({
            success: true,
            message: "Child pickup application approved",
            driverId
        });

    } catch (error) {
        console.error("Error approving child pickup application:", error);
        const statusCode = error.message.includes("not found") ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Deny a child pickup application
export const denyChildPickupApplication = async (req, res) => {
    const { applicationId, driverId, reason } = req.body;

    if (!applicationId || !driverId || !reason) {
        return res.status(400).json({
            success: false,
            message: "Application ID, driver ID, and reason are required"
        });
    }

    try {
        await db.runTransaction(async (transaction) => {
            const applicationRef = db.collection('child-pickup-applications').doc(applicationId);
            const driverRef = db.collection('drivers').doc(driverId);

            const [applicationDoc, driverDoc] = await Promise.all([
                transaction.get(applicationRef),
                transaction.get(driverRef)
            ]);

            if (!applicationDoc.exists) {
                throw new Error("Child pickup application not found");
            }

            if (!driverDoc.exists) {
                throw new Error("Driver not found");
            }

            transaction.update(applicationRef, {
                childPickUpStatus: 'denied',
                childPickUpDenialReason: reason,
                updatedAt: FieldValue.serverTimestamp()
            });

            transaction.update(driverRef, {
                childPickUpStatus: 'denied',
                childPickUpDenialReason: reason
            });
        });

        return res.status(200).json({
            success: true,
            message: "Child pickup application denied",
            driverId
        });

    } catch (error) {
        console.error("Error denying child pickup application:", error);
        const statusCode = error.message.includes("not found") ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all child pickup applications
export const getAllChildPickupApplications = async (req, res) => {
    try {
        const applicationsSnapshot = await db.collection('child-pickup-applications').get();
        
        if (applicationsSnapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "No child pickup applications found"
            });
        }

        const applications = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({
            success: true,
            applications
        });

    } catch (error) {
        console.error("Error fetching child pickup applications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};