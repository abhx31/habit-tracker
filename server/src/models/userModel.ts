import mongoose from "mongoose";

const EarnedBadgeSchema = new mongoose.Schema(
    {
        habitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Habit",
            required: true,
        },
        badge: {
            type: String,
            enum: [
                "Getting Started",
                "Bronze",
                "Silver",
                "Gold",
                "Diamond",
                "Overachiever"
            ],
            required: true,
        },
        dateEarned: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        earnedBadges: {
            type: [EarnedBadgeSchema],
            default: [],
        },
        // Add other fields like phone, role, etc. as per your original schema
    },
    { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);