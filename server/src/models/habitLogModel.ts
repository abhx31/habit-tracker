import mongoose from "mongoose"

const HabitLogSchema = new mongoose.Schema({
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
    date: String,
})
export const HabitLog = mongoose.model('HabitLog', HabitLogSchema)