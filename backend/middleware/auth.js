
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Please sign in first"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        message: "Account not found"
      });
    }

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired session"
    });
  }
};

// Admin and Super Admin access
export const adminOnly = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.user?.role)) {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

// Super Admin access only
export const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({
      message: "Super Admin access required"
    });
  }

  next();
};
