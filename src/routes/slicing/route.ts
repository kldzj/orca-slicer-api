import { Router } from "express";
import { uploadModel } from "../../middleware/upload";
import { AppError } from "../../middleware/error";
import type { SliceMetaData, SlicingSettings } from "./models";
import { getMetaDataFromFile, sliceModel } from "./slicing.service";
import fs from "fs/promises";
import path from "path";
import archiver from "archiver";

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
      const metadata = await getMetaDataFromFile(gcodes[0]);
      res.set(generateMetaDataHeaders(metadata));

      res.download(gcodes[0]);
    } finally {
      await fs.rm(workdir, { recursive: true, force: true });
    }
  } else if (gcodes.length > 1) {
    const metadata: SliceMetaData = {
      printTime: 0,
      filamentUsedG: 0,
      filamentUsedMm: 0,
    };

    for (const filePath of gcodes) {
      if (!filePath.endsWith(".gcode")) return;

      const fileMetadata = await getMetaDataFromFile(filePath);
      metadata.printTime += fileMetadata.printTime;
      metadata.filamentUsedG += fileMetadata.filamentUsedG;
      metadata.filamentUsedMm += fileMetadata.filamentUsedMm;
    }

    res.set(generateMetaDataHeaders(metadata));

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

function generateMetaDataHeaders(metadata: SliceMetaData) {
  const headers: Record<string, string> = {};
  headers["X-Print-Time-Seconds"] = metadata.printTime.toString();
  headers["X-Filament-Used-g"] = metadata.filamentUsedG.toString();
  headers["X-Filament-Used-mm"] = metadata.filamentUsedMm.toString();
  return headers;
}

export default router;
