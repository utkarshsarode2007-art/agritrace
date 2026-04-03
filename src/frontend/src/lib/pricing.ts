// Realistic market rates per kg (INR) for common crops
export const CROP_PRICE_PER_KG: Record<string, number> = {
  maize: 20,
  corn: 20,
  wheat: 25,
  rice: 30,
  basmati: 45,
  "basmati rice": 45,
  paddy: 20,
  sorghum: 18,
  millet: 22,
  barley: 18,
  soybean: 40,
  mustard: 50,
  cotton: 60,
  sugarcane: 3,
  potato: 15,
  onion: 20,
  tomato: 25,
};

// Supply chain markup per stage
const STAGE_MARKUP: Record<string, number> = {
  farmer_to_supplier: 0.05,
  supplier_to_distributor: 0.08,
  distributor_to_retailer: 0.12,
  retailer_to_consumer: 0.15,
};

/**
 * Look up price per kg for a crop name (case-insensitive, fuzzy match).
 * Falls back to 25 per kg if crop is not found.
 */
export function getPricePerKg(cropName: string): number {
  const key = cropName.toLowerCase().trim();
  if (CROP_PRICE_PER_KG[key] !== undefined) return CROP_PRICE_PER_KG[key];

  for (const [k, v] of Object.entries(CROP_PRICE_PER_KG)) {
    if (key.includes(k) || k.includes(key)) return v;
  }

  return 25;
}

export type StageKey =
  | "farmer_to_supplier"
  | "supplier_to_distributor"
  | "distributor_to_retailer"
  | "retailer_to_consumer";

/**
 * Calculate stage transaction amount based on quantity (kg), crop name, and stage.
 */
export function calcStageAmount(
  cropName: string,
  quantityKg: number,
  stage: StageKey,
): number {
  const baseRate = getPricePerKg(cropName);
  const markup = STAGE_MARKUP[stage] ?? 0.05;
  return Math.round(baseRate * quantityKg * (1 + markup));
}

/**
 * Calculate base total (farmer price x quantity).
 */
export function calcTotalPrice(cropName: string, quantityKg: number): number {
  return Math.round(getPricePerKg(cropName) * quantityKg);
}

/**
 * Parse quantity string to a valid kg number. Returns 0 if invalid.
 */
export function parseQuantityKg(quantity: string): number {
  const val = Number.parseFloat(quantity);
  return Number.isNaN(val) || val <= 0 ? 0 : val;
}
