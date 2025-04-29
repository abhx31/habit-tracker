import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { User } from "../models/userModel";
import { AuthenticatedRequest } from "../types/AuthenticateRequest";

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(400).json({
                message: "Authentication token is missing",
            })
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(400).json({
                message: "Token is missing"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_PASSWORD as string) as { email: string }

        const user = await User.findOne({
            email: decoded.email
        })
        if (!user) {
            return res.status(404).json({
                message: "User does not exist",
            })
        }
        const id = user._id;
        (req as AuthenticatedRequest).id = id;
        next();
    } catch (e) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
}
export { AuthenticatedRequest }