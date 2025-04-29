// routes/habitRoutes.ts
import express, { RequestHandler } from "express";
import {
    createHabit,
    getHabits,
    getHabitById,
    updateHabit,
    deleteHabit
} from "../controllers/habitController";
import { authenticateUser } from "../middleware/auth";

const habitRoutes = express.Router();

habitRoutes.use(authenticateUser as RequestHandler);

habitRoutes.post("/", createHabit as unknown as RequestHandler);
habitRoutes.get("/", getHabits as unknown as RequestHandler);
habitRoutes.get("/:id", getHabitById as unknown as RequestHandler);
habitRoutes.put("/:id", updateHabit as unknown as RequestHandler);
habitRoutes.delete("/:id", deleteHabit as unknown as RequestHandler);

export default habitRoutes;
