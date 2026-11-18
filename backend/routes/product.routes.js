import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";
const router = Router();
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
fs.mkdirSync(dir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedImages = ["image/jpeg", "image/png", "image/webp"];
    const allowedVideos = ["video/mp4"];

    if (
      allowedImages.includes(file.mimetype) ||
      allowedVideos.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP images and MP4 videos are allowed."));
    }
  }
});

router.get("/", async (req, res) => {
  const { category, collection, search, featured, limit = 100 } = req.query;
  const filter = { active: true };
  if (category) filter.category = category;
  if (collection) filter.collection = collection;
  if (featured === "true") filter.featured = true;
  if (search) filter.$text = { $search: search };
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 100, 100));
  res.json({ products });
});
router.get("/admin/all", protect, adminOnly, async (_req, res) => res.json({ products: await Product.find().sort({ createdAt: -1 }) }));
router.get("/:id", async (req, res) => {
  const product = await Product.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }], active: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});
router.post("/upload", protect, adminOnly, upload.array("images", 5), (req, res) => {
  res.status(201).json({ images: (req.files || []).map(f => `/uploads/${f.filename}`) });
  router.post("/upload-video", protect, adminOnly, upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select an MP4 video." });
  }

  res.status(201).json({
    video: `/uploads/${req.file.filename}`
  });
});
});
router.post("/", protect, adminOnly, async (req, res) => {
  const data = { ...req.body, slug: (req.body.slug || req.body.name).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") };
  const product = await Product.create(data);
  res.status(201).json({ product });
});
router.put("/:id", protect, adminOnly, async (req, res) => {
  const data = { ...req.body };
  if (data.name && !data.slug) data.slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-");
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
export default router;
