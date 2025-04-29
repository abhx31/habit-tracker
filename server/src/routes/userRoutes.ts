import { RequestHandler, Router } from "express";
import { deleteUser, getUser, updateUser } from "../controllers/userController";
import { authenticateUser } from "../middleware/auth";

export const userRoutes = Router();

userRoutes.get('/', authenticateUser as RequestHandler, getUser as unknown as RequestHandler);
userRoutes.put('/update', authenticateUser as RequestHandler, updateUser as unknown as RequestHandler);
userRoutes.delete('/delete', authenticateUser as RequestHandler, deleteUser as unknown as RequestHandler);