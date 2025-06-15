import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { createTodo, deleteTodo, getTodoById, getTodos, markTodoDone, updateTodo } from "../controllers/todoController";

export const todoRoute = Router();
todoRoute.get('/', authenticateUser as any, getTodos as any);
todoRoute.post('/', authenticateUser as any, createTodo as any);
todoRoute.put('/done/:id', authenticateUser as any, markTodoDone as any);
todoRoute.get('/:id', authenticateUser as any, getTodoById as any);
todoRoute.put('/:id', authenticateUser as any, updateTodo as any);
todoRoute.delete('/:id', authenticateUser as any, deleteTodo as any);