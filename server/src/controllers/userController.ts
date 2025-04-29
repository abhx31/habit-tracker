import { Response } from "express"
import { User } from "../models/userModel"
import { AuthenticatedRequest } from "../types/AuthenticateRequest";

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.id;
        const user = await User.findOne({ _id: id })

        return res.status(200).json({
            message: "User details are",
            user
        })

    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.id;
        const { name, age, email } = req.body;

        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({
                message: "Invalid User"
            })
        }

        const modifiedUser = await User.findByIdAndUpdate(
            id,
            { name, age, email },
            { new: true }
        );

        return res.status(200).json({
            message: "Changes done successfully",
            modifiedUser
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

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.id;
        const getUser = await User.findOne({ _id: id });

        if (!getUser) {
            return res.status(404).json({
                message: "User does not exist"
            })
        }

        await User.findOneAndDelete({ _id: id });

        return res.status(200).json({
            message: "User Deleted Successfully"
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}