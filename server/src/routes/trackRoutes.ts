import { RequestHandler, Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { 
    getHabitHistory, 
    getStatistics, 
    getLogToday, 
    getTrackerSummary, 
    markHabitDone, 
    getAllUserStatistics, 
    getCombinedHeatmapData, 
    getHeatmapData,
    getLeaderboard,
    getUserRank
} from "../controllers/trackController";

export const trackRoute = Router();

trackRoute.use(authenticateUser as RequestHandler);

// Specific routes first
trackRoute.get('/today', authenticateUser as RequestHandler, getLogToday as unknown as RequestHandler);
trackRoute.get("/leaderboard", authenticateUser as RequestHandler, getLeaderboard as unknown as RequestHandler);
trackRoute.get("/user-rank", authenticateUser as RequestHandler, getUserRank as unknown as RequestHandler);
trackRoute.get("/all", getAllUserStatistics as unknown as RequestHandler);
trackRoute.get("/stats", authenticateUser as any, getStatistics as unknown as RequestHandler);
trackRoute.get("/heatmap/combined", getCombinedHeatmapData as unknown as RequestHandler);

// Then parameterized routes
trackRoute.get("/summary/:id", authenticateUser as any, getTrackerSummary as unknown as RequestHandler);
trackRoute.get("/heatmap/:habitId", getHeatmapData as unknown as RequestHandler);
trackRoute.get("/:id", authenticateUser as any, getHabitHistory as unknown as RequestHandler);

// POST routes
trackRoute.post("/", authenticateUser as any, markHabitDone as unknown as RequestHandler);