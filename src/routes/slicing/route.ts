import { Router } from "express";
import { uploadModel } from "../../middleware/upload";
import { AppError } from "../../middleware/error";
import type { SlicingSettings } from "./models";
import { sliceModel } from "./slicing.service";
import fs from "fs/promises";
import path from "path";
import archiver from "archiver";
import { listSettings } from "../profiles/settings.service";

const router = Router();

router.post("/", uploadModel.single("file"), async (req, res) => {
  if (!req.file) {
    throw new AppError(400, "File is required for slicing");
  }

  const { gcodes, workdir } = await sliceModel(
    req.file.buffer,
    req.file.originalname,
    req.body as SlicingSettings
  );

  if (gcodes.length === 1) {
    try {
      res.download(gcodes[0]);
    } finally {
      await fs.rm(workdir, { recursive: true, force: true });
    }
  } else if (gcodes.length > 1) {
    res.attachment("result.zip");
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw new AppError(500, `Error creating archive: ${err.message}`);
    });

    res.on("finish", async () => {
      await fs.rm(workdir, { recursive: true, force: true });
    });

    archive.pipe(res);
    gcodes.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });

    await archive.finalize();
  } else {
    throw new AppError(500, "No files generated during slicing");
  }
});

export default router;
