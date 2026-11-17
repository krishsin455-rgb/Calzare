
import mongoose from "mongoose";

const websiteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
    },
    homepage: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    story: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("WebsiteContent", websiteContentSchema);
