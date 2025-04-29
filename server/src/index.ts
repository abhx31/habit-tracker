import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import cors from "cors"
import habitRoutes from "./routes/habitRoutes";
import { analyticsRoutes } from "./routes/analyticsRoutes";
import { trackRoute } from "./routes/trackRoutes";

dotenv.config();
const app = express()
connectDB(process.env.MONGO_URI as string);

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/habits', habitRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/track', trackRoute)

app.listen(process.env.PORT, () => {
    console.log(`App is listening on ${process.env.PORT}`);
})


