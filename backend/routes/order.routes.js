
import { Router } from "express";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// Place a new order
router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      shipping,
      total,
      paymentMethod,
      razorpayOrderId,
    } = req.body;

    if (!items?.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "Please provide all required order details." });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      shipping,
      total,
      paymentMethod,
      razorpayOrderId,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not place order." });
  }
});

// Admin: get all orders
router.get("/", protect, adminOnly, async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Could not load orders." });
  }
});

// Customer: get their own orders
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Could not load your orders." });
  }
});

// Admin: update order status
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const allowedStatuses = [
      "Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Could not update order status." });
  }
});

export default router;
