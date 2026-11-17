import { Router } from "express";
import Contact from "../models/Contact.js";
const router = Router();
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "Please complete all fields" });
  await Contact.create({ name, email, message });
  res.status(201).json({ message: "Thanks for contacting Calzare. We'll get back to you." });
});
export default router;
