import type React from "react";
import { createContext, useContext, useState } from "react";
import { calcStageAmount, parseQuantityKg } from "../lib/pricing";
import type { StageKey } from "../lib/pricing";
import type {
  Batch,
  StageUpdate,
  Transaction,
  UserRole,
} from "../lib/supply-chain-types";
import {
  STAGE_ORDER,
  generateBatchId,
  generateTxHash,
} from "../lib/supply-chain-types";

interface SupplyChainContextType {
  batches: Batch[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  createBatch: (data: {
    cropName: string;
    variety: string;
    quantity: string;
    unit: string;
    farmLocation: string;
    farmerName: string;
    harvestDate: string;
  }) => void;
  addUpdate: (
    batchId: string,
    update: Omit<StageUpdate, "id" | "batchId" | "timestamp">,
  ) => void;
  advanceStage: (batchId: string) => void;
  getBatch: (batchId: string) => Batch | undefined;
}

const SupplyChainContext = createContext<SupplyChainContextType | null>(null);

export function SupplyChainProvider({
  children,
}: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>("farmer");

  const createBatch = (data: {
    cropName: string;
    variety: string;
    quantity: string;
    unit: string;
    farmLocation: string;
    farmerName: string;
    harvestDate: string;
  }) => {
    const id = generateBatchId();
    const now = new Date();
    const newBatch: Batch = {
      id,
      ...data,
      currentStage: "farmer",
      status: "harvested",
      createdAt: now,
      updates: [
        {
          id: `upd-${Date.now()}`,
          batchId: id,
          stage: "farmer",
          action: "Register Crop",
          details: `${data.quantity} ${data.unit} of ${data.variety} ${data.cropName} registered.`,
          location: data.farmLocation,
          handler: data.farmerName,
          timestamp: now,
        },
      ],
      transactions: [],
    };
    setBatches((prev) => [newBatch, ...prev]);
  };

  const addUpdate = (
    batchId: string,
    update: Omit<StageUpdate, "id" | "batchId" | "timestamp">,
  ) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              updates: [
                ...b.updates,
                {
                  ...update,
                  id: `upd-${Date.now()}`,
                  batchId,
                  timestamp: new Date(),
                },
              ],
            }
          : b,
      ),
    );
  };

  const advanceStage = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const currentIdx = STAGE_ORDER.indexOf(b.currentStage);
        if (currentIdx >= STAGE_ORDER.length - 1) return b;
        const nextStage = STAGE_ORDER[currentIdx + 1];

        const stageKeyMap: Record<string, StageKey> = {
          farmer: "farmer_to_supplier",
          supplier: "supplier_to_distributor",
          distributor: "distributor_to_retailer",
          retailer: "retailer_to_consumer",
        };
        const stageKey = stageKeyMap[b.currentStage] ?? "farmer_to_supplier";
        const amount = calcStageAmount(
          b.cropName,
          parseQuantityKg(b.quantity),
          stageKey,
        );

        const txId = `txn-${Date.now()}`;
        const newTx: Transaction = {
          id: txId,
          batchId,
          from: b.currentStage,
          to: nextStage,
          amount,
          currency: "INR",
          timestamp: new Date(),
          status: "completed",
          txHash: generateTxHash(txId),
        };
        const statusMap: Record<UserRole, Batch["status"]> = {
          farmer: "harvested",
          supplier: "in-transit",
          distributor: "stored",
          retailer: "delivered",
          consumer: "delivered",
        };
        return {
          ...b,
          currentStage: nextStage,
          status: statusMap[nextStage],
          transactions: [...b.transactions, newTx],
        };
      }),
    );
  };

  const getBatch = (batchId: string) => batches.find((b) => b.id === batchId);

  return (
    <SupplyChainContext.Provider
      value={{
        batches,
        currentRole,
        setCurrentRole,
        createBatch,
        addUpdate,
        advanceStage,
        getBatch,
      }}
    >
      {children}
    </SupplyChainContext.Provider>
  );
}

export function useSupplyChain() {
  const ctx = useContext(SupplyChainContext);
  if (!ctx)
    throw new Error("useSupplyChain must be used within SupplyChainProvider");
  return ctx;
}
