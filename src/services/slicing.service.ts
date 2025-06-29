import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";
import { AppError } from "../middleware/error";

export interface SliceSettings {
  printer: string;
  preset: string;
  filament: string;
  bedType: string;
  plate?: number | "all";
}

export interface SliceResult {
  gcodes: string[];
  workdir: string;
}

export async function sliceModel(
  file: Buffer,
  filename: string,
  settings: SliceSettings
): Promise<SliceResult> {
  let workdir: string;
  let inPath: string;
  let outputDir: string;
  try {
    workdir = await fs.mkdtemp(path.join(os.tmpdir(), "slice-"));
    const inputDir = path.join(workdir, "input");
    outputDir = path.join(workdir, "output");
    await fs.mkdir(inputDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
    inPath = path.join(inputDir, filename);
    await fs.writeFile(inPath, file);
  } catch (error) {
    throw new AppError(
      500,
      "Failed to prepare slicing",
      error instanceof Error ? error.message : String(error)
    );
  }

  const basePath = process.env.DATA_PATH || path.join(process.cwd(), "data");
  const settingsArg = `${basePath}/printers/${settings.printer}.json;${basePath}/presets/${settings.preset}.json`;
  const sliceArg =
    settings.plate === "all" ? "0" : String(settings.plate ?? 1);

  const args = [
    "--arrange",
    "1",
    "--orient",
    "1",
    "--slice",
    sliceArg,
    "--allow-newer-file",
    "--load-settings",
    settingsArg,
    "--load-filaments",
    `${basePath}/filaments/${settings.filament}.json`,
    "--outputdir",
    outputDir,
    "--curr-bed-type",
    settings.bedType,
    inPath,
  ];

  if (!process.env.ORCASLICER_PATH) {
    throw new AppError(
      500,
      "Slicing is not configured properly on the server",
      "ORCASLICER_PATH environment variable is not defined"
    );
  }

  try {
    execFileSync(process.env.ORCASLICER_PATH, args, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    await fs.rm(workdir, { recursive: true, force: true });
    throw new AppError(
      500,
      "Failed to slice the model",
      err instanceof Error ? err.message : String(err)
    );
  }

  const files = await fs.readdir(outputDir);
  const gcodes = files
    .filter((f) => f.toLowerCase().endsWith(".gcode"))
    .map((f) => path.join(outputDir, f));

  return { gcodes, workdir };
}
