// controllers/analyticsController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { HabitLog } from "../models/trackModel";
import mongoose from "mongoose";

// Progress for a habit
export const getHabitProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: habitId } = req.params;

        const logs = await HabitLog.find({ userId: req.id, habitId }).sort({ date: 1 });

        const totalDays = logs.length;
        const firstLog = logs[0]?.date;
        const lastLog = logs[logs.length - 1]?.date;

        res.status(200).json({
            totalLogs: totalDays,
            firstLog,
            lastLog,
            logs
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// Stats: Longest streak, category stats
export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const logs = await HabitLog.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.id) } },
            {
                $group: {
                    _id: "$habitId",
                    daysCompleted: { $sum: 1 },
                    dates: { $push: "$date" }
                }
            }
        ]);

        res.status(200).json({
            stats: logs
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
