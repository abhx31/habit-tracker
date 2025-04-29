import { RequestHandler, Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { getHabitProgress, getUserStats } from "../controllers/analyticsController";

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticateUser as RequestHandler)

analyticsRoutes.get('/', getUserStats as unknown as RequestHandler);
analyticsRoutes.get('/:id', getHabitProgress as unknown as RequestHandler);