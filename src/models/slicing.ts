export interface SlicingSettings {
  printer: string;
  preset: string;
  filament: string;
  bedType: string;
}

export type Category = "printers" | "presets" | "filaments";
