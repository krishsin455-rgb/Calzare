import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";
const router = Router();
const buildItems = async (items) => {
  if (!Array.isArray(items) || !items.length) throw new Error("Your cart is empty");
  const output = [];
  for (const item of items) {
    const p = await Product.findById(item.productId);
    if (!p || !p.active) throw new Error("A product in your cart is unavailable");
    const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
    if (p.stock < quantity) throw new Error(`${p.name} does not have enough stock`);
    output.push({ product: p._id, name: p.name, image: p.images[0] || "", price: p.price, size: item.size || "", quantity });
  }
  return output;
};
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode)
      return res.status(400).json({ message: "Complete the shipping address" });
    if (!["cod","razorpay"].includes(paymentMethod)) return res.status(400).json({ message: "Invalid payment method" });
    const orderItems = await buildItems(items);
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 79;
    const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress, subtotal, shipping, total: subtotal + shipping, paymentMethod });
    if (paymentMethod === "cod") {
      for (const item of orderItems) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    res.status(201).json({ order });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.get("/mine", protect, async (req, res) => res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) }));
router.get("/", protect, adminOnly, async (_req, res) => res.json({ orders: await Order.find().populate("user","name email").sort({ createdAt: -1 }) }));
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  const allowed = ["Placed","Confirmed","Packed","Shipped","Delivered","Cancelled"];
  if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ message: "Invalid status" });
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
});
export default router;
