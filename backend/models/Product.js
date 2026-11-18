
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    enum: ["Men", "Women", "Unisex"],
    default: "Unisex"
  },
  collection: {
    type: String,
    default: "New Arrivals"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    default: 0
  },
  images: [{ type: String }],
  video: {
  type: String,
  default: ""
},
  sizes: [{ type: String }],
  colors: [{ type: String }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

productSchema.index({
  name: "text",
  description: "text",
  collection: "text"
});

export default mongoose.model("Product", productSchema);
