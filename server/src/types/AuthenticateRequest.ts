// types/AuthenticatedRequest.ts
import { Request } from "express"
import mongoose from "mongoose"

export interface AuthenticatedRequest extends Request {
    id: mongoose.Types.ObjectId
}
