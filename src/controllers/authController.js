import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from "../config/firebase.js";

const auth = getAuth();

export const registerPassengerController = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
    }

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const idToken = userCredential._tokenResponse.idToken;
        if(idToken){
            res.cookie('access_token', idToken, {
                httpOnly: true
            });
            res.status(200).json({ message: "User created successfully", userCredential })
        } else {
            res.status(500).json({ error: "Internal Server Error" })
        }
    })
    .catch((error) => {
        const errorMessage = error.message || "An error occurred while registering user";
        res.status(500).json({ error: errorMessage });
    })
}

export const signinPassengerController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
    }

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const idToken = userCredential._tokenResponse.idToken;
        if(idToken){
            res.cookie('access_token', idToken, {
                httpOnly: true
            });
            res.status(200).json({ message: "User logged in successfully", userCredential })
        } else {
            res.status(500).json({ error: "Internal Server Error" })
        }
    })
    .catch((error) => {
        console.error(error);
        const errorMessage = error.message || "An error occurred while logging in";
        res.status(500).json({ error: errorMessage });
    })
}

export const signoutPassengerController = async (req, res) => {
    signOut(auth)
    .then(() => {
        res.clearCookie("access-token")
        res.status(200).json({message: "User logged out successfully"})
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal server Error "})
    })
}

export const registerDriverController = async (req, res) => {

}

export const signinDriverController = async (req, res) => {

}

export const signoutDriverController = async (req, res) => {

}

