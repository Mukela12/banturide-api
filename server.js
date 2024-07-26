import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./src/routes/userRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js"
import profile from "./src/routes/profileRoutes.js"

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors());

app.use("/auth", userRoutes);
app.use("/Booking", bookingRoutes)
app.use('/profile', profile);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})

