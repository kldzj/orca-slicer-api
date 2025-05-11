import { Router } from "express";

import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";
import { uploadModel } from "../../middleware/upload";
import type { SlicingSettings } from "../../models/slicing";
import { listSettings } from "../profiles/data/settings.service";

const router = Router();

router.post("/", uploadModel.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      error: "File is required",
    });
    return;
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
    res.status(400).json({
      error:
        "Invalid slicing settings. 'printer', 'preset', and 'filament' are required.",
    });
    return;
  }

  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "slice-"));
  const inputDir = path.join(workdir, "input");
  const outputDir = path.join(workdir, "output");
  await fs.mkdir(inputDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const originalName = req.file.originalname;
  const inPath = path.join(inputDir, originalName);
  await fs.writeFile(inPath, req.file.buffer);

  const basePath = process.env.DATA_PATH || path.join(process.cwd(), "data");

  const settingsArg = `${basePath}/printers/${printer}.json;${basePath}/presets/${preset}.json`;
  const args = [
    "--arrange",
    "1",
    "--orient",
    "1",
    "--slice",
    "1",
    "--allow-newer-file",
    "--load-settings",
    settingsArg,
    "--load-filaments",
    `${basePath}/filaments/${filament}.json`,
    "--outputdir",
    outputDir,
    "--curr-bed-type",
    bedType,
    inPath,
  ];

  try {
    if (!process.env.ORCASLICER_PATH) {
      throw new Error("ORCASLICER_PATH environment variable is not defined");
    }
    execFileSync(process.env.ORCASLICER_PATH, args, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    await fs.rm(workdir, { recursive: true, force: true });
    console.error(err);
    res.status(500).json({ error: "Slicing failed" });
    return;
  }

  const files = await fs.readdir(outputDir);
  const gcodes = files.filter((f) => f.toLowerCase().endsWith(".gcode"));

  res.download(path.join(outputDir, gcodes[0]));
  await fs.rm(workdir, { recursive: true, force: true });
});

export default router;
