
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function main() {
  try {
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const name = process.env.ADMIN_NAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!process.env.MONGODB_URI || !email || !name || !password) {
      throw new Error("Missing environment variables in backend/.env");
    }

    if (password.length < 12) {
      throw new Error("Admin password must have at least 12 characters");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const hashed = await bcrypt.hash(password, 12);
    let admin = await User.findOne({ email });

    if (admin) {
      admin.name = name;
      admin.password = hashed;
      admin.role = "admin";
      await admin.save();
    } else {
      await User.create({
        name,
        email,
        password: hashed,
        role: "admin"
      });
    }

    console.log("Admin account successfully created or updated.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main();
