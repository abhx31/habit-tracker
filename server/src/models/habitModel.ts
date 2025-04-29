import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: String,
    goal: {
        target: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    },
    frequency: {
        type: {
            type: String, // daily, weekly, etc.
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Habit = mongoose.model('Habit', HabitSchema)
