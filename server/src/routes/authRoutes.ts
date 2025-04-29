import express, { Router } from "express";
import { signIn, signup } from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post('/signup', signup as any);
authRoutes.post('/signin', signIn as any);