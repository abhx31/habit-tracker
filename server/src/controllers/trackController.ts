import { Response, Request } from "express";
import { HabitLog } from "../models/trackModel";
import { AuthenticatedRequest } from "../types/AuthenticateRequest";
import { User } from "../models/userModel";
import mongoose from "mongoose";
import dayjs from "dayjs";
import { Habit } from "../models/habitModel";

const getBadge = (streak: number): string | null => {
    if (streak >= 365) return "Overachiever";
    if (streak >= 180) return "Ace";
    if (streak >= 90) return "Diamond";
    if (streak >= 30) return "Gold";
    if (streak >= 7) return "Silver";
    if (streak >= 1) return "Bronze";
    return null;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const markHabitDone = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { habitId, date, completed } = req.body;
        const logDate = date ? new Date(date) : new Date();

        const startOfDay = new Date(formatDate(logDate));
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        // Create or update the log
        let log = await HabitLog.findOne({
            userId,
            habitId,
            date: { $gte: startOfDay, $lt: endOfDay },
        });

        if (log) {
            log.completed = completed;
            await log.save();
        } else {
            log = await HabitLog.create({ userId, habitId, date: logDate, completed });
        }

        const allLogs = await HabitLog.find({ userId, habitId }).sort({ date: 1 });

        let currentStreak = 0;
        for (let i = allLogs.length - 1; i >= 0; i--) {
            const log = allLogs[i];
            if (!log.completed) break;

            if (i === allLogs.length - 1) currentStreak = 1;
            else {
                const prevLog = allLogs[i + 1];
                const expectedDate = dayjs(prevLog.date).subtract(1, 'day').format('YYYY-MM-DD');
                const currentDate = dayjs(log.date).format('YYYY-MM-DD');

                if (currentDate === expectedDate) currentStreak++;
                else break;
            }
        }

        const badge = getBadge(currentStreak);

        if (badge) {
            const user = await User.findById(userId);

            const badgeIndex = user?.earnedBadges?.findIndex(b => b.habitId.toString() === habitId);

            if (badgeIndex !== undefined && badgeIndex !== -1) {
                // Update the existing badge
                await User.updateOne(
                    { _id: userId, [`earnedBadges.${badgeIndex}.habitId`]: habitId },
                    {
                        $set: {
                            [`earnedBadges.${badgeIndex}.badge`]: badge,
                            [`earnedBadges.${badgeIndex}.dateEarned`]: new Date(),
                        }
                    }
                );
            } else {
                // Add new badge
                await User.updateOne(
                    { _id: userId },
                    {
                        $push: {
                            earnedBadges: {
                                habitId,
                                badge,
                                dateEarned: new Date(),
                            }
                        }
                    }
                );
            }
        }



        return res.status(log ? 200 : 201).json({
            message: log ? "Habit updated" : "Habit marked",
            log: { ...log.toObject(), date: formatDate(log.date) },
            currentStreak,
            badge,
        });

    } catch (e) {
        console.error("markHabitDone error:", e);
        res.status(500).json({ message: "Something went wrong" });
    }
};


export const getHabitHistory = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.id;
    const { id: habitId } = req.params;
    try {
        // Only get completed logs
        const logs = await HabitLog.find({ 
            userId, 
            habitId,
            completed: true 
        }).sort({ date: -1 }); // Sort by date descending

        // Calculate current streak
        let currentStreak = 0;
        if (logs.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if the most recent log is from today
            const mostRecentLog = logs[0];
            const mostRecentDate = new Date(mostRecentLog.date);
            mostRecentDate.setHours(0, 0, 0, 0);
            
            if (mostRecentDate.getTime() === today.getTime()) {
                currentStreak = 1;
                let prevDate = today;
                
                // Check consecutive previous days
                for (let i = 1; i < logs.length; i++) {
                    const currentDate = new Date(logs[i].date);
                    currentDate.setHours(0, 0, 0, 0);
                    
                    const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        currentStreak++;
                        prevDate = currentDate;
                    } else {
                        break;
                    }
                }
            }
        }

        const formattedLogs = logs.map(log => ({ 
            ...log.toObject(), 
            date: formatDate(log.date),
            currentStreak 
        }));

        res.status(200).json({ 
            logs: formattedLogs,
            currentStreak
        });
    } catch (e) {
        res.status(500).json({ message: "Unable to fetch logs" });
    }
};

export const getTrackerSummary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { id: habitId } = req.params;

        const logs = await HabitLog.find({ userId, habitId }).sort({ date: 1 });
        let currentStreak = 0;

        for (let i = logs.length - 1; i >= 0; i--) {
            const log = logs[i];
            if (!log.completed) break;

            if (i === logs.length - 1) {
                currentStreak = 1;
            } else {
                const prevLog = logs[i + 1];
                const expectedDate = dayjs(prevLog.date).subtract(1, 'day').format('YYYY-MM-DD');
                const currentDate = dayjs(log.date).format('YYYY-MM-DD');
                if (currentDate === expectedDate) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        const badge = getBadge(currentStreak);

        res.status(200).json({
            totalLogs: logs.length,
            firstLog: logs.length > 0 ? formatDate(logs[0].date) : null,
            lastLog: logs.length > 0 ? formatDate(logs[logs.length - 1].date) : null,
            currentStreak,
            badge,
            logs: logs.map(log => ({ ...log.toObject(), date: formatDate(log.date) })),
        });

    } catch (e) {
        console.error("getTrackerSummary error:", e);
        res.status(500).json({ message: "Unable to show summary" });
    }
};


export const getLogToday = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const today = new Date();
        const startOfDay = new Date(`${formatDate(today)}T00:00:00.000Z`);
        const endOfDay = new Date(`${formatDate(today)}T23:59:59.999Z`);

        const logs = await HabitLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startOfDay, $lte: endOfDay },
            completed: true,
        }).sort({ date: 1 });

        return res.status(200).json({
            count: logs.length,
            logs: logs.map(log => ({ ...log.toObject(), date: formatDate(log.date) })),
        });
    } catch (error) {
        console.error("Error in getLogToday:", error);
        return res.status(500).json({ message: "Unable to fetch today's logs" });
    }
};
export const getAllUserStatistics = async (req: Request, res: Response) => {
    try {
        const users = await User.find();

        const allUserStats = [];

        for (const user of users) {
            const userId = user._id.toString();

            // 1. Get all habits for the user
            const habits = await Habit.find({ userId });
            const totalHabits = habits.length;

            // Create a map of habitId to { name, badge }
            const habitMap = new Map<string, { name: string; badge?: string | null }>();
            for (const habit of habits) {
                habitMap.set(habit._id.toString(), {
                    name: habit.name,
                    badge: habit.badge || null,
                });
            }

            // 2. Get all habit logs for the user
            const habitLogs = await HabitLog.find({ userId }).sort({ date: 1 });
            const totalCompletions = habitLogs.filter((log) => log.completed).length;

            const habitStats: {
                [habitId: string]: {
                    name: string;
                    badge?: string | null;
                    total: number;
                    completed: number;
                    currentStreak: number;
                    maxStreak: number;
                    lastDate: Date | null;
                };
            } = {};

            for (const log of habitLogs) {
                const habitId = log.habitId.toString();

                if (!habitStats[habitId]) {
                    const habitInfo = habitMap.get(habitId);
                    habitStats[habitId] = {
                        name: habitInfo?.name || "Unknown Habit",
                        badge: habitInfo?.badge || null,
                        total: 0,
                        completed: 0,
                        currentStreak: 0,
                        maxStreak: 0,
                        lastDate: null,
                    };
                }

                habitStats[habitId].total += 1;
                if (log.completed) {
                    habitStats[habitId].completed += 1;

                    const prevDate = habitStats[habitId].lastDate;
                    const currentDate = new Date(log.date);
                    currentDate.setUTCHours(0, 0, 0, 0);

                    if (!prevDate) {
                        habitStats[habitId].currentStreak = 1;
                    } else {
                        const diff =
                            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                        if (diff === 1) {
                            habitStats[habitId].currentStreak += 1;
                        } else if (diff > 1) {
                            habitStats[habitId].currentStreak = 1;
                        }
                    }

                    if (habitStats[habitId].currentStreak > habitStats[habitId].maxStreak) {
                        habitStats[habitId].maxStreak = habitStats[habitId].currentStreak;
                    }

                    habitStats[habitId].lastDate = currentDate;
                }
            }

            // Most Consistent Habit
            let mostConsistentHabit = null;
            let highestRate = 0;
            for (const [habitId, stats] of Object.entries(habitStats)) {
                const rate = stats.completed / stats.total;
                if (rate > highestRate && stats.total > 0) {
                    highestRate = rate;
                    mostConsistentHabit = {
                        habitId,
                        habitName: stats.name,
                        badge: stats.badge,
                        completionRate: `${(rate * 100).toFixed(1)}%`,
                    };
                }
            }

            // Longest Streak
            let longestStreak = 0;
            let longestStreakHabit = null;
            for (const [habitId, stats] of Object.entries(habitStats)) {
                if (stats.maxStreak > longestStreak) {
                    longestStreak = stats.maxStreak;
                    longestStreakHabit = {
                        habitId,
                        habitName: stats.name,
                        badge: stats.badge,
                        maxStreak: stats.maxStreak,
                    };
                }
            }

            // Construct user statistics
            const userStats = {
                userId,
                userName: user.name,
                totalHabits,
                totalCompletions,
                earnedBadges: user.earnedBadges || [],
                mostConsistentHabit,
                longestStreakHabit,
                habits: Object.entries(habitStats).map(([habitId, stats]) => ({
                    habitId,
                    name: stats.name,
                    badge: stats.badge,
                    completionRate: stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}%` : '0%',
                    maxStreak: stats.maxStreak,
                })),
            };

            allUserStats.push(userStats);
        }

        return res.status(200).json(allUserStats);
    } catch (error) {
        console.error("getAllUserStatistics error:", error);
        return res.status(500).json({ message: "Failed to fetch all user statistics" });
    }
};



export const getStatistics = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;

        // 1. Total Habits Tracked
        const habits = await Habit.find({ userId });
        const totalHabits = habits.length;

        // Map habitId -> habit info (name + badge)
        const habitMap = new Map<string, { name: string, badge?: string }>();
        for (const habit of habits) {
            habitMap.set(habit._id.toString(), {
                name: habit.name,
                badge: habit.badge || null,
            });
        }

        // 2. Total Completions
        const totalCompletions = await HabitLog.countDocuments({
            userId,
            completed: true,
        });

        // 3. Group logs by habit for completion rates and streaks
        const habitLogs = await HabitLog.find({ userId }).sort({ date: 1 });

        const habitStats: {
            [habitId: string]: {
                name: string;
                badge?: string | null;
                total: number;
                completed: number;
                currentStreak: number;
                maxStreak: number;
                lastDate: Date | null;
            };
        } = {};

        for (const log of habitLogs) {
            const habitId = log.habitId.toString();

            if (!habitStats[habitId]) {
                const habitInfo = habitMap.get(habitId);
                habitStats[habitId] = {
                    name: habitInfo?.name || "Unknown Habit",
                    badge: habitInfo?.badge || null,
                    total: 0,
                    completed: 0,
                    currentStreak: 0,
                    maxStreak: 0,
                    lastDate: null,
                };
            }

            habitStats[habitId].total += 1;
            if (log.completed) {
                habitStats[habitId].completed += 1;

                const prevDate = habitStats[habitId].lastDate;
                const currentDate = new Date(log.date);
                currentDate.setUTCHours(0, 0, 0, 0);

                if (!prevDate) {
                    habitStats[habitId].currentStreak = 1;
                } else {
                    const diff =
                        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                    if (diff === 1) {
                        habitStats[habitId].currentStreak += 1;
                    } else if (diff > 1) {
                        habitStats[habitId].currentStreak = 1;
                    }
                }

                if (habitStats[habitId].currentStreak > habitStats[habitId].maxStreak) {
                    habitStats[habitId].maxStreak = habitStats[habitId].currentStreak;
                }

                habitStats[habitId].lastDate = currentDate;
            }
        }

        // 4. Most Consistent Habit
        let mostConsistentHabit = null;
        let highestRate = 0;

        for (const [habitId, stats] of Object.entries(habitStats)) {
            const rate = stats.completed / stats.total;
            if (rate > highestRate && stats.total > 0) {
                highestRate = rate;
                mostConsistentHabit = {
                    habitId,
                    habitName: stats.name,
                    badge: stats.badge,
                    completionRate: `${(rate * 100).toFixed(1)}%`,
                };
            }
        }

        // 5. Longest Streak
        let longestStreak = 0;
        let longestStreakHabit = null;

        for (const [habitId, stats] of Object.entries(habitStats)) {
            if (stats.maxStreak > longestStreak) {
                longestStreak = stats.maxStreak;
                longestStreakHabit = {
                    habitId,
                    habitName: stats.name,
                    badge: stats.badge,
                    maxStreak: stats.maxStreak,
                };
            }
        }

        // 6. User Badges
        const user = await User.findById(userId);
        const earnedBadges = user?.earnedBadges || [];

        return res.status(200).json({
            totalHabits,
            totalCompletions,
            mostConsistentHabit,
            longestStreakHabit,
            earnedBadges, // array of strings
            habits: Object.entries(habitStats).map(([habitId, stats]) => ({
                habitId,
                name: stats.name,
                badge: stats.badge,
                completionRate: stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}%` : '0%',
                maxStreak: stats.maxStreak,
            })),
        });
    } catch (error) {
        console.error("getStatistics error:", error);
        return res.status(500).json({ message: "Failed to calculate statistics" });
    }
};

export const getHeatmapData = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { habitId } = req.params;

        // Get logs for the past year
        const oneYearAgo = dayjs().subtract(1, 'year').toDate();
        const logs = await HabitLog.find({
            userId,
            habitId,
            date: { $gte: oneYearAgo },
            completed: true
        }).sort({ date: 1 });

        // Group logs by date and count completions
        const heatmapData = logs.reduce((acc: any[], log) => {
            const date = formatDate(log.date);
            const existingEntry = acc.find(entry => entry.date === date);

            if (existingEntry) {
                existingEntry.count += 1;
            } else {
                acc.push({ date, count: 1 });
            }

            return acc;
        }, []);

        return res.status(200).json(heatmapData);
    } catch (error) {
        console.error("Error in getHeatmapData:", error);
        return res.status(500).json({ message: "Unable to fetch heatmap data" });
    }
};

export const getCombinedHeatmapData = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;

        // Get logs for the past year
        const oneYearAgo = dayjs().subtract(1, 'year').toDate();
        const logs = await HabitLog.find({
            userId,
            date: { $gte: oneYearAgo },
            completed: true
        }).sort({ date: 1 });

        console.log('Raw logs from database:', logs);

        // Group logs by date and count completions
        const heatmapData = logs.reduce((acc: any[], log) => {
            const date = formatDate(log.date);
            const existingEntry = acc.find(entry => entry.date === date);

            if (existingEntry) {
                existingEntry.count += 1;
            } else {
                acc.push({ date, count: 1 });
            }

            return acc;
        }, []);

        console.log('Processed heatmap data:', heatmapData);
        return res.status(200).json(heatmapData);
    } catch (error) {
        console.error("Error in getCombinedHeatmapData:", error);
        return res.status(500).json({ message: "Unable to fetch combined heatmap data" });
    }
};

interface HabitStats {
    habitId: mongoose.Types.ObjectId;
    habitName: string;
    badge: string | null;
    completionRate: number;
}

interface LongestStreakHabit {
    habitId: mongoose.Types.ObjectId;
    habitName: string;
    badge: string | null;
    maxStreak: number;
}

export const getLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = (req.query.search as string) || ""
        const skip = (page - 1) * limit

        // Get all users with their stats
        const query = search
            ? { name: { $regex: search, $options: "i" } }
            : {}

        const [users, total] = await Promise.all([
            User.find(query).skip(skip).limit(limit),
            User.countDocuments(query)
        ])

        const userStats = await Promise.all(users.map(async (user) => {
            const userId = user._id.toString()
            
            // Get total habits
            const totalHabits = await Habit.countDocuments({ userId })
            
            // Get total completions
            const totalCompletions = await HabitLog.countDocuments({
                userId,
                completed: true
            })

            // Get most consistent habit
            const habits = await Habit.find({ userId })
            const habitStats: HabitStats[] = await Promise.all(habits.map(async (habit) => {
                const logs = await HabitLog.find({ habitId: habit._id })
                const completed = logs.filter(log => log.completed).length
                return {
                    habitId: habit._id,
                    habitName: habit.name,
                    badge: habit.badge || null,
                    completionRate: logs.length > 0 ? completed / logs.length : 0
                }
            }))

            const mostConsistentHabit = habitStats.length > 0 
                ? habitStats.reduce((prev, curr) => 
                    curr.completionRate > prev.completionRate ? curr : prev
                )
                : null

            // Get longest streak habit
            let longestStreakHabit: LongestStreakHabit | null = null
            let maxStreakOverall = 0

            for (const habit of habits) {
                const logs = await HabitLog.find({ habitId: habit._id }).sort({ date: 1 })
                let currentStreak = 0
                let maxStreak = 0

                for (let i = 0; i < logs.length; i++) {
                    if (logs[i].completed) {
                        currentStreak++
                        maxStreak = Math.max(maxStreak, currentStreak)
                    } else {
                        currentStreak = 0
                    }
                }

                if (maxStreak > maxStreakOverall) {
                    maxStreakOverall = maxStreak
                    longestStreakHabit = {
                        habitId: habit._id,
                        habitName: habit.name,
                        badge: habit.badge || null,
                        maxStreak
                    }
                }
            }

            return {
                userId,
                userName: user.name,
                totalHabits,
                totalCompletions,
                earnedBadges: user.earnedBadges || [],
                mostConsistentHabit,
                longestStreakHabit
            }
        }))

        // Sort by total completions
        userStats.sort((a, b) => b.totalCompletions - a.totalCompletions)

        return res.status(200).json({
            users: userStats,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error("getLeaderboard error:", error)
        return res.status(500).json({ message: "Failed to fetch leaderboard" })
    }
}

export const getUserRank = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id.toString()

        // Get all users with their completion counts
        const users = await User.find()
        const userStats = await Promise.all(users.map(async (user) => {
            const completions = await HabitLog.countDocuments({
                userId: user._id,
                completed: true
            })
            return {
                userId: user._id.toString(),
                completions
            }
        }))

        // Sort by completions
        userStats.sort((a, b) => b.completions - a.completions)

        // Find user's rank
        const rank = userStats.findIndex(stat => stat.userId === userId) + 1

        return res.status(200).json({ rank })
    } catch (error) {
        console.error("getUserRank error:", error)
        return res.status(500).json({ message: "Failed to fetch user rank" })
    }
}