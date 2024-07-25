import { admin } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
    const idToken = req.cookies.access_token;

    if(!idToken){
        return res.status(403).json({error: 'No Token Provided'})
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch(error) {
        console.error("Error verifying token:", error);
        return res.status(403).json({error: "Unauthorised"})
    }
};