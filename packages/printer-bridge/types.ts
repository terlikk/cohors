// PrintFlow — Printer Bridge Types
// Abstrakcja nad różnymi API drukarek

export type PrinterApiType = "moonraker" | "octoprint" | "bambu_cloud" | "prusa_connect";

export interface PrinterConnection {
  apiUrl: string;
  apiType: PrinterApiType;
  apiKey?: string;
  cameraUrl?: string;
}

// ==================== UNIFIED PRINTER STATUS ====================

export interface PrinterState {
  status: "idle" | "printing" | "paused" | "error" | "offline" | "maintenance";
  temperatures: {
    hotend: { current: number; target: number };
    bed: { current: number; target: number };
    chamber?: { current: number; target: number };
  };
  currentJob?: {
    fileName: string;
    progress: number; // 0-100
    currentLayer?: number;
    totalLayers?: number;
    elapsedSeconds: number;
    estimatedTotalSeconds: number;
    filamentUsedMm?: number;
  };
  error?: string;
}

// ==================== PRINTER ADAPTER INTERFACE ====================

export interface PrinterAdapter {
  /** Pobierz aktualny status drukarki */
  getState(): Promise<PrinterState>;

  /** Rozpocznij druk z pliku GCode */
  startPrint(gcodeUrl: string): Promise<void>;

  /** Pauzuj druk */
  pausePrint(): Promise<void>;

  /** Wznów druk */
  resumePrint(): Promise<void>;

  /** Anuluj druk */
  cancelPrint(): Promise<void>;

  /** Wyślij GCode do drukarki */
  sendGcode(commands: string[]): Promise<void>;

  /** Pobierz snapshot z kamery */
  getCameraSnapshot(): Promise<Buffer | null>;

  /** Subskrybuj na live updates (WebSocket) */
  onStateChange(callback: (state: PrinterState) => void): () => void;
}

// ==================== SLICING ====================

export interface SliceRequest {
  modelUrl: string; // URL do STL/3MF
  material: string; // PLA, PETG, ABS...
  layerHeight: number; // mm
  infill: number; // 0-100 %
  supports: boolean;
  printerProfile: string; // profil drukarki w slicerze
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
  marginPercent: number; // np. 30
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

// ==================== QUEUE / SCHEDULING ====================

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

/**
 * Wybierz najlepszą drukarkę dla zlecenia.
 * Priorytet: materiał match → rozmiar → najkrótsza kolejka
 */
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

  // Sortuj po długości kolejki (najkrótsza = najlepsza)
  eligible.sort((a, b) => a.queueLength - b.queueLength);
  return eligible[0];
}
