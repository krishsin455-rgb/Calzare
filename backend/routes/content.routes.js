import "dotenv/config";
import { Router } from "express";
import WebsiteContent from "../models/WebsiteContent.js";
import { protect, adminOnly } from "../middleware/auth.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
const router = Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("CLOUDINARY CHECK:", {
  cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
});
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
     cb(new Error("Only JPG, PNG, WEBP and AVIF images are allowed."));
    }
  },
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only MP4 videos are allowed."));
    }
  },
});
router.post(
  "/upload-story-video",
  protect,
  adminOnly,
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an MP4 video.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "calzare/story",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      });

      res.status(201).json({
        video: result.secure_url,
      });
    } catch (error) {
      console.error("STORY VIDEO UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Could not upload story video.",
      });
    }
  }
);
router.post(
  "/upload-image",
  protect,
  adminOnly,
  imageUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a valid image.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "calzare/content",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      });

      res.status(201).json({
        image: result.secure_url,
      });
    } catch (error) {
      console.error("CONTENT IMAGE UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Could not upload image.",
      });
    }
  }
);
router.get("/", async (_req, res) => {
  try {
    let content = await WebsiteContent.findOne({ key: "main" });

    if (!content) {
      content = await WebsiteContent.create({ key: "main" });
    }

    res.json({
      homepage: content.homepage,
      story: content.story,
    });
  } catch (error) {
    console.error("CONTENT GET ERROR:", error);
    res.status(500).json({ message: "Could not load website content." });
  }
});

router.put("/", protect, adminOnly, async (req, res) => {
  try {
    const { homepage, story } = req.body;

    const content = await WebsiteContent.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          ...(homepage !== undefined ? { homepage } : {}),
          ...(story !== undefined ? { story } : {}),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (!content) {
      return res.status(404).json({ message: "Website content not found." });
    }

    res.json({
      message: "Website content updated successfully.",
      homepage: content.homepage,
      story: content.story,
    });
  } catch (error) {
    console.error("CONTENT PUT ERROR:", error);
    res.status(500).json({ message: "Could not update website content." });
  }
});

export default router;
