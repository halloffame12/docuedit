
export interface TextRegion {
  id: string;
  text: string;
  x: number; // 0-100 (percentage)
  y: number; // 0-100 (percentage)
  width: number;
  height: number;
  detectedColor: string; // Hex or descriptive color
  confidence: number;
  inkType: 'ballpoint' | 'printed' | 'fountain' | 'unknown';
}

export interface DocumentState {
  originalImage: string | null;
  editedImage: string | null;
  isAnalyzing: boolean;
  isProcessing: boolean;
  regions: TextRegion[];
  selectedRegionId: string | null;
  history: string[];
}
