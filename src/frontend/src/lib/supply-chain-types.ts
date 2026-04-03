export type UserRole =
  | "farmer"
  | "supplier"
  | "distributor"
  | "retailer"
  | "consumer";

export interface StageUpdate {
  id: string;
  batchId: string;
  stage: UserRole;
  action: string;
  details: string;
  location: string;
  handler: string;
  timestamp: Date;
  temperature?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  batchId: string;
  from: UserRole;
  to: UserRole;
  amount: number;
  currency: string;
  timestamp: Date;
  status: "pending" | "completed";
  txHash?: string;
}

export interface Batch {
  id: string;
  cropName: string;
  variety: string;
  quantity: string;
  unit: string;
  farmLocation: string;
  farmerName: string;
  harvestDate: string;
  currentStage: UserRole;
  status: "in-transit" | "stored" | "delivered" | "harvested" | "processing";
  createdAt: Date;
  updates: StageUpdate[];
  transactions: Transaction[];
}

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: string; color: string; actions: string[] }
> = {
  farmer: {
    label: "Farmer",
    icon: "🌾",
    color: "farmer",
    actions: ["Register Crop", "Update Harvest", "Ship to Supplier"],
  },
  supplier: {
    label: "Supplier / Transporter",
    icon: "🚛",
    color: "supplier",
    actions: ["Pick Up Batch", "Update Transit", "Deliver to Warehouse"],
  },
  distributor: {
    label: "Distributor / Warehouse",
    icon: "🏭",
    color: "distributor",
    actions: ["Receive Shipment", "Quality Check", "Dispatch to Retailer"],
  },
  retailer: {
    label: "Retailer",
    icon: "🏪",
    color: "retailer",
    actions: ["Receive Stock", "Shelf Product", "Sell to Consumer"],
  },
  consumer: {
    label: "Consumer",
    icon: "👤",
    color: "consumer",
    actions: ["Scan QR Code", "View Journey", "Verify Authenticity"],
  },
};

export const STAGE_ORDER: UserRole[] = [
  "farmer",
  "supplier",
  "distributor",
  "retailer",
  "consumer",
];

export function generateBatchId(): string {
  const prefix = "AGR";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a deterministic-looking mock blockchain transaction hash.
 * Uses the transaction id as a seed for repeatability.
 */
export function generateTxHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  const extra = (Math.abs(hash * 31) >>> 0)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");
  return `0x${hex}${extra}`;
}

/**
 * Helper to check if a batch has received payment to the farmer
 * (i.e., a completed farmer→supplier transaction exists).
 */
export function getFarmerPayment(batch: Batch): Transaction | null {
  return (
    batch.transactions.find(
      (tx) =>
        tx.from === "farmer" &&
        tx.to === "supplier" &&
        tx.status === "completed",
    ) ?? null
  );
}
