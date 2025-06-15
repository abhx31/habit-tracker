import mongoose from "mongoose";

const HabitLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
}, { timestamps: true });

HabitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export const HabitLog = mongoose.model('HabitLog', HabitLogSchema);