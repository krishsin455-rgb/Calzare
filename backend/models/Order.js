import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String, image: String, price: Number, size: String, quantity: Number
  }],
  shippingAddress: {
    name: String, phone: String, line1: String, line2: String,
    city: String, state: String, pincode: String
  },
  subtotal: Number, shipping: Number, total: Number,
  paymentMethod: { type: String, enum: ["cod", "razorpay"], required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  orderStatus: { type: String, enum: ["Placed", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Placed" },
  razorpayOrderId: String, razorpayPaymentId: String
}, { timestamps: true });
export default mongoose.model("Order", orderSchema);
