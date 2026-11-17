
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";

const promoteSuperAdmin = async () => {
  try {
    const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();

    if (!email) {
      throw new Error("SUPERADMIN_EMAIL is missing.");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingSuperAdmin = await User.findOne({
      role: "superadmin"
    });

    if (existingSuperAdmin) {
      throw new Error("A Super Admin account already exists.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("No existing account found with that email.");
    }

    user.role = "superadmin";
    await user.save();

    console.log("Super Admin account created successfully.");
    console.log("Account:", user.email);
  } catch (error) {
    console.error("Setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

promoteSuperAdmin();
