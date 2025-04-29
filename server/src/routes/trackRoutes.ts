import { RequestHandler, Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { getHabitHistory, getLogToday, getTrackerSummary, markHabitDone } from "../controllers/trackController";

export const trackRoute = Router();

trackRoute.use(authenticateUser as RequestHandler);

trackRoute.get('/today', authenticateUser as RequestHandler, getLogToday as unknown as RequestHandler)
trackRoute.get("/summary/:id", getTrackerSummary as unknown as RequestHandler); // <-- specific first
trackRoute.get("/:id", getHabitHistory as unknown as RequestHandler);
trackRoute.post("/", markHabitDone as unknown as RequestHandler);

