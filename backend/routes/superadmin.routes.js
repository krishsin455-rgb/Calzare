
import express from "express";
import { protect, superAdminOnly } from "../middleware/auth.js";

import {
  getUsers,
  updateUserRole,
  deleteUser
} from "../controllers/superadmin.controller.js";

const router = express.Router();

// All routes require Super Admin authentication
router.use(protect, superAdminOnly);

// View all users
router.get("/users", getUsers);

// Change customer/admin role
router.patch("/users/:id/role", updateUserRole);

// Delete customer/admin
router.delete("/users/:id", deleteUser);

export default router;
