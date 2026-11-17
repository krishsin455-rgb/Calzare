
import { Router } from "express";
import WebsiteContent from "../models/WebsiteContent.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// Public: get homepage and story content
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
    res.status(500).json({ message: "Could not load website content." });
  }
});

// Admin: save homepage and story content
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
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Website content saved successfully.",
      homepage: content.homepage,
      story: content.story,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not save website content." });
  }
});

export default router;
