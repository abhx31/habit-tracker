import { Response } from "express";
import { Habit } from "../models/habitModel";
import { AuthenticatedRequest } from "../types/AuthenticateRequest";

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, goal, frequency, category } = req.body

        // Validate nested fields if needed
        if (!goal?.target || !goal?.unit) {
            return res.status(400).json({ message: 'Goal is missing required fields.' })
        }

        const habit = new Habit({
            userId: req.id,
            name,
            goal: {
                target: goal.target,
                unit: goal.unit,
            },
            frequency: {
                type: frequency.type,
            },
            category
        })

        await habit.save()
        res.status(201).json(habit)
    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }
}


export const getHabits = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.id;
        const habits = await Habit.find({ userId: id });

        return res.status(200).json({
            message: "Your Habits are",
            habits
        })
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}

export const getHabitById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id;
        const userId = req.id;
        const habit = await Habit.findOne({ _id: id, userId })

        if (!habit) {
            return res.status(404).json({
                message: "Habit not found"
            })
        }

        res.status(200).json({
            message: "Habit fetched successfully",
            habit
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const id = req.params.id;
        const { name, category, goal, frequency } = req.body;

        const updatedHabit = await Habit.findOneAndUpdate(
            { _id: id, userId },
            { name, category, goal, frequency },
            { new: true }
        );

        if (!updatedHabit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        return res.status(200).json(updatedHabit); // <-- Send full updated habit


    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const id = req.params.id;

        const getHabit = await Habit.findOneAndDelete({ _id: id, userId })

        res.status(200).json({
            message: "Habit Deleted Successfully"
        })

    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}