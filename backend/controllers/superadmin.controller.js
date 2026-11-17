
import User from "../models/User.js";

// Get all customers and admins
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Could not load users" });
  }
};

// Change a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({
        message: "Super Admin role cannot be changed here"
      });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update user role"
    });
  }
};

// Delete a customer or admin account
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({
        message: "Super Admin cannot be deleted here"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete user"
    });
  }
};
