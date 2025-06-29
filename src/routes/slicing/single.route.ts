import { Router } from "express";
import * as fs from "fs/promises";
import { uploadModel } from "../../middleware/upload";
import { listSettings } from "../profiles/settings.service";
import type { SlicingSettings } from "./models";
import { sliceModel } from "../../services/slicing.service";
import { AppError } from "../../middleware/error";

const router = Router();

router.post("/", uploadModel.single("file"), async (req, res) => {
  if (!req.file) {
    throw new AppError(400, "File is required for slicing");
  }

  const { printer, preset, filament, bedType } = req.body as SlicingSettings;

  if (
    !printer ||
    !preset ||
    !filament ||
    !bedType ||
    !(await listSettings("printers")).includes(printer) ||
    !(await listSettings("presets")).includes(preset) ||
    !(await listSettings("filaments")).includes(filament)
  ) {
    throw new AppError(400, "Invalid or missing slicing settings");
  }

  const { gcodes, workdir } = await sliceModel(req.file.buffer, req.file.originalname, {
    printer,
    preset,
    filament,
    bedType,
    plate: 1,
  });

  try {
    res.download(gcodes[0]);
  } finally {
    await fs.rm(workdir, { recursive: true, force: true });
  }
});

export default router;
