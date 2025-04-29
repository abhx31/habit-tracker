import { Response } from "express";
import { HabitLog } from "../models/trackModel";
import { AuthenticatedRequest } from "../types/AuthenticateRequest";
import mongoose from "mongoose";

// Helper to format a Date to YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const markHabitDone = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { habitId, date, completed } = req.body;

        const logDate = date ? new Date(date) : new Date(); // Always Date object
        console.log("Fetching logs for userId:", userId, "habitId:", habitId);
        // Check if a log already exists for this habit and date
        const existing = await HabitLog.findOne({
            userId,
            habitId,
            date: {
                $gte: new Date(formatDate(logDate)),
                $lt: new Date(new Date(formatDate(logDate)).getTime() + 24 * 60 * 60 * 1000) // next day
            }
        });

        if (existing) {
            existing.completed = completed;
            await existing.save();
            return res.status(200).json({
                message: "Habit updated",
                log: {
                    ...existing.toObject(),
                    date: formatDate(existing.date)
                },
            });
        } else {
            const log = await HabitLog.create({
                userId,
                habitId,
                date: logDate,
                completed,
            });

            return res.status(201).json({
                message: "Habit Marked",
                log: {
                    ...log.toObject(),
                    date: formatDate(log.date)
                },
            });
        }
    } catch (e) {
        console.error("markHabitDone error:", e);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getHabitHistory = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.id;
    const { id: habitId } = req.params;

    try {
        // console.log("Fetching logs for userId:", userId, "habitId:", habitId);
        const habitObjectId = new mongoose.Types.ObjectId(habitId);

        const logs = await HabitLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            habitId: habitObjectId
        }).sort({ date: 1 });


        const formattedLogs = logs.map(log => ({
            ...log.toObject(),
            date: formatDate(log.date),
        }));

        res.status(200).json({ logs: formattedLogs });
    } catch (e) {
        res.status(500).json({ message: "Unable to fetch logs" });
    }
};

export const getTrackerSummary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { id: habitId } = req.params;

        const logs = await HabitLog.find({ userId, habitId }).sort({ date: 1 });

        const formattedLogs = logs.map(log => ({
            ...log.toObject(),
            date: formatDate(log.date),
        }));

        // Calculate current streak
        let currentStreak = 0;
        for (let i = logs.length - 1; i >= 0; i--) {
            if (logs[i].completed) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate completion rate
        const totalCompleted = logs.filter(log => log.completed).length;
        const completionRate = logs.length > 0 ? totalCompleted / logs.length : 0;

        return res.status(200).json({
            totalLogs: logs.length,
            firstLog: logs.length > 0 ? formatDate(logs[0].date) : null,
            lastLog: logs.length > 0 ? formatDate(logs[logs.length - 1].date) : null,
            currentStreak,
            completionRate,
            logs: formattedLogs,
        });
    } catch (e) {
        console.error("getTrackerSummary error:", e);
        res.status(500).json({ message: "Unable to show summary" });
    }
};


export const getLogToday = async (req: AuthenticatedRequest, res: Response) => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    try {
        const userId = req.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const today = new Date();
        const formattedToday = formatDate(today);
        const startOfDay = new Date(`${formattedToday}T00:00:00.000Z`);
        const endOfDay = new Date(`${formattedToday}T23:59:59.999Z`);

        console.log("Fetching today's logs for:", { userId, startOfDay, endOfDay });

        const logs = await HabitLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startOfDay, $lte: endOfDay },
            completed: true,
        }).sort({ date: 1 });

        console.log(`Found ${logs.length} logs`);

        return res.status(200).json({
            count: logs.length,
            logs: logs.map(log => ({
                ...log.toObject(),
                date: formatDate(log.date),
            })),
        });
    } catch (error) {
        console.error("Error in getLogToday:", error);
        return res.status(500).json({ message: "Unable to fetch today's logs" });
    }
};
