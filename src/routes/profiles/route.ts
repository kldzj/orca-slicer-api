import { Router } from "express";
import { uploadJson } from "../../middleware/upload";
import type { Category } from "../slicing/models";
import { saveSetting, listSettings, getSetting } from "./settings.service";

const router = Router();

router.post("/:category", uploadJson.single("file"), async (req, res) => {
  const name = req.body.name;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: "Name cannot be empty",
    });
    return;
  }

  if (!/^[a-zA-Z0-9]+$/.test(name)) {
    res.status(400).json({
      error: "Name must only contain letters and numbers",
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      error: "File is required",
    });
    return;
  }

  if (
    !req.params.category ||
    !["printers", "presets", "filaments"].includes(req.params.category)
  ) {
    res.status(400).json({
      error: "Invalid or missing category",
    });
    return;
  }

  const content = JSON.parse(req.file.buffer.toString("utf8"));
  await saveSetting(req.params.category as Category, name, content);
  res.status(201).json({ message: "Setting saved successfully", name });
});

router.get("/:category", async (req, res) => {
  if (
    !req.params.category ||
    !["printers", "presets", "filaments"].includes(req.params.category)
  ) {
    res.status(400).json({
      error: "Invalid or missing category",
    });
    return;
  }

  const settings = await listSettings(req.params.category as Category);
  res.status(200).json(settings);
});

router.get("/:category/:name", async (req, res) => {
  if (
    !req.params.category ||
    !["printers", "presets", "filaments"].includes(req.params.category)
  ) {
    res.status(400).json({
      error: "Invalid or missing category",
    });
    return;
  }

  const name = req.params.name;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: "Name cannot be empty",
    });
    return;
  }
  try {
    const setting = await getSetting(req.params.category as Category, name);
    res.status(200).json(setting);
  } catch (error) {
    console.error(error);
    res.status(404).json({
      error: "Setting not found",
    });
  }
});

export default router;
