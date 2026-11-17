import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Product from "../models/Product.js";
const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!email || !process.env.ADMIN_PASSWORD) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first");
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name: process.env.ADMIN_NAME || "Calzare Admin", email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD,12), role: "admin" });
    console.log("Admin created:", email);
  } else {
    admin.role = "admin"; await admin.save(); console.log("Existing account promoted to admin:", email);
  }
  const count = await Product.countDocuments();
  if (!count) {
    const demo = [
      ["The Verona Loafer","Men","Everyday Classics",2499,3299,"https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1000","A refined everyday loafer with a clean silhouette."],
      ["The Siena Sneaker","Women","New Arrivals",2199,2899,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000","A versatile sneaker made for everyday movement."],
      ["The Milano Derby","Men","Bestsellers",2799,3599,"https://images.unsplash.com/photo-1614252369475-5318f7c9f3c2?w=1000","A polished classic for work and occasions."],
      ["The Alba Flat","Women","Bestsellers",1799,2299,"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1000","An understated flat designed for all-day wear."]
    ];
    await Product.insertMany(demo.map(([name,category,collection,price,compareAtPrice,image,description],i)=>({
      name, slug:name.toLowerCase().replace(/[^a-z0-9]+/g,"-"), category, collection, price, compareAtPrice, images:[image],
      description, sizes:["36","37","38","39","40","41"], colors:["Black","Tan"], stock:20, featured:i<2, active:true
    })));
    console.log("Demo products added");
  }
  await mongoose.disconnect();
};
run().catch(e=>{ console.error(e); process.exit(1); });
