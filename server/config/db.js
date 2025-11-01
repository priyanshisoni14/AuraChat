import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"));
    mongoose.connection.on("error", (err) => console.error("MongoDB Error:", err));

    const mongoURI = process.env.MONGODB_URL?.trim();

    if (!mongoURI) {
      throw new Error("MongoDB connection string is missing in environment variables");
    }

    await mongoose.connect(mongoURI);

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); 
  }
};

export default connectDB;
