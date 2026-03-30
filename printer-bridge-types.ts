export type PrinterApiType = "moonraker" | "octoprint" | "bambu_cloud" | "prusa_connect";

export interface PrinterConnection {
  apiUrl: string;
  apiType: PrinterApiType;
  apiKey?: string;
  cameraUrl?: string;
}

export interface PrinterState {
  status: "idle" | "printing" | "paused" | "error" | "offline" | "maintenance";
  temperatures: {
    hotend: { current: number; target: number };
    bed: { current: number; target: number };
    chamber?: { current: number; target: number };
  };
  currentJob?: {
    fileName: string;
    progress: number;
    currentLayer?: number;
    totalLayers?: number;
    elapsedSeconds: number;
    estimatedTotalSeconds: number;
    filamentUsedMm?: number;
  };
  error?: string;
}

export interface PrinterAdapter {
  getState(): Promise<PrinterState>;
  startPrint(gcodeUrl: string): Promise<void>;
  pausePrint(): Promise<void>;
  resumePrint(): Promise<void>;
  cancelPrint(): Promise<void>;
  sendGcode(commands: string[]): Promise<void>;
  getCameraSnapshot(): Promise<Buffer | null>;
  onStateChange(callback: (state: PrinterState) => void): () => void;
}

export interface SliceRequest {
  modelUrl: string;
  material: string;
  layerHeight: number;
  infill: number;
  supports: boolean;
  printerProfile: string;
}

export interface SliceResult {
  gcodeUrl: string;
  estimatedMinutes: number;
  estimatedGrams: number;
  layerCount: number;
  filamentLengthMm: number;
}

// ==================== PRICING ====================

export interface PricingConfig {
  materialPricePerKg: number;
  printTimePricePerHour: number;
  printerAmortizationPerHour: number;
  marginPercent: number;
  minimumPrice: number;
  currency: string;
}

export function calculatePrice(
  estimatedMinutes: number,
  estimatedGrams: number,
  config: PricingConfig
): number {
  const hours = estimatedMinutes / 60;
  const kg = estimatedGrams / 1000;
  const materialCost = kg * config.materialPricePerKg;
  const timeCost = hours * config.printTimePricePerHour;
  const amortization = hours * config.printerAmortizationPerHour;
  const subtotal = materialCost + timeCost + amortization;
  const withMargin = subtotal * (1 + config.marginPercent / 100);
  return Math.max(withMargin, config.minimumPrice);
}

// ==================== SCHEDULER ====================

export interface SchedulingCriteria {
  materialType: string;
  minBedSizeX: number;
  minBedSizeY: number;
  minBedSizeZ: number;
  nozzleDiameter: number;
  priority: number;
}

export interface PrinterCapability {
  printerId: string;
  bedSizeX: number;
  bedSizeY: number;
  bedSizeZ: number;
  nozzleDiameter: number;
  loadedMaterial: string;
  status: PrinterState["status"];
  queueLength: number;
}

export function findBestPrinter(
  criteria: SchedulingCriteria,
  printers: PrinterCapability[]
): PrinterCapability | null {
  const eligible = printers.filter(
    (p) =>
      p.status === "idle" &&
      p.loadedMaterial === criteria.materialType &&
      p.bedSizeX >= criteria.minBedSizeX &&
      p.bedSizeY >= criteria.minBedSizeY &&
      p.bedSizeZ >= criteria.minBedSizeZ &&
      p.nozzleDiameter === criteria.nozzleDiameter
  );
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => a.queueLength - b.queueLength);
  return eligible[0];
}
