import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
    await mongoose.connect(uri).then(() => {
        console.log("DB connected!")
    }).catch((e) => {
        console.log("Error in connecting to DB")
    })
}