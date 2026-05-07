export interface Regulation {
  regulation_id: string;
  authority: string;
  authorityHe?: string;
  title: string;
  titleHe?: string;
  requirements: string[];
  requirementsHe?: string[];
  effective_date?: string;
  [key: string]: any;
}

export type RegulationFileStatus = "raw" | "processed";

export interface RegulationFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  rawText: string;
  status: RegulationFileStatus;
  entries: Regulation[];
}
