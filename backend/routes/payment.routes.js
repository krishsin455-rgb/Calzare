import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";
const router = Router();
const razorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error("Razorpay keys are not configured on the server");
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};
router.post("/razorpay/order", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id, paymentMethod: "razorpay", paymentStatus: "pending" });
    if (!order) return res.status(404).json({ message: "Pending order not found" });
    const rp = await razorpay().orders.create({ amount: Math.round(order.total * 100), currency: "INR", receipt: String(order._id) });
    order.razorpayOrderId = rp.id;
    await order.save();
    res.json({ key: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rp.id, amount: rp.amount, currency: rp.currency });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id, paymentMethod: "razorpay", paymentStatus: "pending" });
    if (!order || order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ message: "Order verification failed" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const a = Buffer.from(expected), b = Buffer.from(razorpay_signature || "");
    if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) return res.status(400).json({ message: "Invalid payment signature" });
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    for (const item of order.items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    res.json({ success: true, order });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
export default router;
