import { Request, Response } from "express"
import bcrypt from "bcrypt";
import { User } from "../models/userModel";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, age, email, password } = req.body;
        console.log("Signup Controller");

        const existingMail = await User.findOne({ email });

        if (existingMail) {
            return res.status(400).json({
                message: "Email already exists",
            })
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const createUser = await User.create({
            name,
            age,
            email,
            password: hashPassword,
        })

        return res.status(201).json({
            createUser
        })

    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}

export const signIn = async (req: Request, res: Response) => {
    try {
        console.log("Signin controller")
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }
        const token = jwt.sign({ email }, process.env.JWT_PASSWORD as string);

        return res.status(200).json({
            message: "Login Successful",
            token,
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