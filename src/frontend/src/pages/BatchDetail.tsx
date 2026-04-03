import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { BatchTimeline } from "../components/BatchTimeline";
import { QRViewer } from "../components/QRViewer";
import { SupplyChainFlow } from "../components/SupplyChainFlow";
import { TransactionLog } from "../components/TransactionLog";
import { useSupplyChain } from "../context/SupplyChainContext";
import { calcTotalPrice, getPricePerKg, parseQuantityKg } from "../lib/pricing";
import { getFarmerPayment } from "../lib/supply-chain-types";

function truncateHash(hash: string): string {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function BatchDetail() {
  const { batchId } = useParams({ from: "/layout/batch/$batchId" });
  const { getBatch } = useSupplyChain();
  const batch = getBatch(batchId);

  if (!batch) {
    return (
      <div
        data-ocid="batch_detail.error_state"
        className="min-h-screen flex items-center justify-center text-muted-foreground"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium">Batch not found</p>
          <p className="text-sm mt-1">Batch ID: {batchId}</p>
          <Link to="/">
            <Button className="mt-4" variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pricePerKg = getPricePerKg(batch.cropName);
  const quantityKg = parseQuantityKg(batch.quantity);
  const totalPrice = calcTotalPrice(batch.cropName, quantityKg);
  const farmerPayment = getFarmerPayment(batch);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Batch Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {batch.cropName}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {batch.variety}
              </p>
            </div>
            <code className="text-xs font-mono bg-muted px-3 py-1.5 rounded-lg text-muted-foreground">
              {batch.id}
            </code>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {batch.quantity} {batch.unit}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {batch.farmLocation}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {batch.farmerName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {batch.harvestDate}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to="/scan/$batchId" params={{ batchId: batch.id }}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
                data-ocid="batch_detail.scan_link"
              >
                <QrCode className="w-3.5 h-3.5" />
                Consumer View
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Supply Chain Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 mb-6 shadow-xs"
        >
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Supply Chain Progress
          </h2>
          <SupplyChainFlow currentStage={batch.currentStage} />
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 mb-6 shadow-xs"
          data-ocid="batch_detail.price_breakdown.card"
        >
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Price Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Market Rate</span>
              <span className="text-sm font-semibold text-foreground">
                ₹{pricePerKg}/kg
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quantity</span>
              <span className="text-sm font-semibold text-foreground">
                {batch.quantity} kg
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Estimated Total
              </span>
              <span className="text-base font-bold text-primary">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Farmer Payment Status */}
            {farmerPayment && (
              <>
                <div className="h-px bg-border" />
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">
                        Payment Received: ₹
                        {farmerPayment.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Badge className="bg-green-600 text-white border-0 text-[11px]">
                      Farmer Paid ✅
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700">
                    Status: Paid ✅ — {batch.farmerName} has received fair
                    compensation for this crop.
                  </p>
                  {farmerPayment.txHash && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-green-200">
                      <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-[11px] text-primary font-medium">
                        Verified on Blockchain
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {truncateHash(farmerPayment.txHash)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Tabs defaultValue="timeline" data-ocid="batch_detail.tabs">
            <TabsList className="w-full mb-4">
              <TabsTrigger
                value="timeline"
                className="flex-1"
                data-ocid="batch_detail.timeline.tab"
              >
                Journey Timeline
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex-1"
                data-ocid="batch_detail.transactions.tab"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="qr"
                className="flex-1"
                data-ocid="batch_detail.qr.tab"
              >
                QR Code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
                <BatchTimeline updates={batch.updates} />
              </div>
            </TabsContent>
            <TabsContent value="transactions">
              <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
                <TransactionLog transactions={batch.transactions} />
              </div>
            </TabsContent>
            <TabsContent value="qr">
              <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
                <QRViewer batch={batch} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
