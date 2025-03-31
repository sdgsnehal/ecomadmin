import mongoose from "mongoose";

export function mongooseConnect() {
  const uri = process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB");
    return mongoose.connection.asPromise();
  } else {
    const uri = process.env.MONGODB_URI;
    console.log("Connecting to MongoDB...");
    return mongoose.connect(uri);
  }
}
