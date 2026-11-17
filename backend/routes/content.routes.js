import { Router } from "express";
import WebsiteContent from "../models/WebsiteContent.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

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
