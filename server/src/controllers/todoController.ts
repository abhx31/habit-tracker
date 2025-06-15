import { Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticateRequest";
import { Todo } from "../models/todosModel";


export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { title, description } = req.body;

        const todo = await Todo.create({
            userId,
            title,
            description,
            completed: false
        })

        return res.status(200).json({
            message: "Todo created successfully",
            todo
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}

export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const todos = await Todo.find({ userId })
        return res.status(200).json({
            message: "Todos fetched successfully",
            todos
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getTodoById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const id = req.params.id;
        const todo = await Todo.findById({ userId, _id: id })
        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
            })
        }

        return res.status(200).json({
            message: "Todo fetched successfully",
            todo
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const id = req.params.id;

        const todo = await Todo.deleteOne({ userId, _id: id })
        return res.status(200).json({
            message: "Todo deleted successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const updateTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const id = req.params.id;
        const { title, description } = req.body;

        const todo = await Todo.findOneAndUpdate(
            { _id: id, userId },
            { $set: { title, description } },
            { new: true } // <-- This makes it return the updated document
        );


        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        return res.status(200).json({
            message: "Todo updated successfully",
            todo,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const markTodoDone = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const id = req.params.id;

        const todo = await Todo.findOneAndUpdate(
            { _id: id, userId },
            { $set: { completed: true } }
        );

        return res.status(200).json({
            message: "Successfully completed",
            todo
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}