import mongoose from "mongoose";

enum Frequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
}

enum Badge {
    BRONZE = "Bronze",
    SILVER = "Silver",
    GOLD = "Gold",
    DIAMOND = "Diamond",
    ACE = "Ace",
    OVERACHIEVER = "Overachiever"
}

const HabitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        category: {
            type: String,
            required: true,
        },
        goal: {
            target: {
                type: Number,
                required: false,
            },
            unit: {
                type: String,
                required: false,
            },
        },
        frequency: {
            type: {
                type: String,
                enum: Object.values(Frequency),
                required: true,
            },
            days: {
                type: [Number],
                required: false,
            },
            dates: {
                type: [Number],
                required: false,
            }
        },
        badge: {
            type: String,
            enum: Object.values(Badge),
            default: Badge.BRONZE,
        },
    },
    { timestamps: true }
);

export const Habit = mongoose.model("Habit", HabitSchema);