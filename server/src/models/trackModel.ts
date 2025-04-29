import mongoose, { mongo } from "mongoose";

const trackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })

export const HabitLog = mongoose.model("HabitLog", trackSchema);