import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../config/firebase.js";

export const registerPassengerController = async (req, res) => {
    const { email, password, firstname, lastname, gender } = req.body;

    if (!email || !password || !firstname || !lastname) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
    }

    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await db.collection('users').doc(user.uid).set({
            firstname,
            lastname,
            email,
            gender,
            role: 'user',
            isDriver: false,
            driverStatus: 'unavailable',
            createdAt: new Date().toISOString()
        });

        res.status(200).json({ message: "User created successfully", userCredential });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "An error occurred while registering user" });
    }
};

export const signinPassengerController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
    }

    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        res.cookie('access_token', idToken, {
            httpOnly: true,
        });

        res.status(200).json({ message: "User logged in successfully", userCredential });
    } catch (error) {
        console.error("Error in login API:", error);
        res.status(500).json({ error: error.message || "An error occurred while logging in", success: false });
    }
};

export const signoutPassengerController = async (req, res) => {
    const auth = getAuth();
    try {
        await signOut(auth);
        res.clearCookie("access-token");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const registerDriverController = async (req, res) => {
    const { email, password, firstname, lastname, dob, phoneNumber, nrcNumber, address } = req.body;

    if (!email || !password || !firstname || !lastname || !dob || !phoneNumber || !nrcNumber || !address) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
            firstname: "First name is required",
            lastname: "Last name is required",
            dob: "Date of birth is required",
            phoneNumber: "Phone number is required",
            nrcNumber: "NRC number is required",
            address: "Address is required",
        });
    }

    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await db.collection('drivers').doc(user.uid).set({
            firstname,
            lastname,
            dob,
            email,
            phoneNumber,
            nrcNumber,
            address,
            role: 'driver',
            driverStatus: 'available',
            location: {
                type: "Point",
                coordinates: [0, 0]
            },
            createdAt: new Date().toISOString()
        });

        res.status(200).json({ message: "Driver registered successfully", userCredential });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "An error occurred while registering driver" });
    }
};

export const signinDriverController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
    }

    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        res.cookie('access_token', idToken, {
            httpOnly: true,
        });

        res.status(200).json({ message: "Driver logged in successfully", userCredential });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "An error occurred while logging in" });
    }
};

export const signoutDriverController = async (req, res) => {
    const auth = getAuth();
    try {
        await signOut(auth);
        res.clearCookie("access-token");
        res.status(200).json({ message: "Driver logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
