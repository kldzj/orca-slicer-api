export interface SlicingSettings {
  printer: string;
  preset: string;
  filament: string;
  bedType: string;
  allPlates?: boolean;
}

export interface SliceResult {
  gcodes: string[];
  workdir: string;
}

export type Category = "printers" | "presets" | "filaments";
