import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  IndianRupee,
  Leaf,
  Plus,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BatchCard } from "../components/BatchCard";
import { useSupplyChain } from "../context/SupplyChainContext";
import { getPricePerKg, parseQuantityKg } from "../lib/pricing";
import { getFarmerPayment } from "../lib/supply-chain-types";

function truncateHash(hash: string): string {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function FarmerDashboard() {
  const { batches, createBatch } = useSupplyChain();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cropName: "",
    variety: "",
    quantity: "",
    unit: "kg",
    farmLocation: "",
    farmerName: "",
    harvestDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cropName || !form.farmerName) return;
    createBatch({ ...form, unit: "kg" });
    setOpen(false);
    setForm({
      cropName: "",
      variety: "",
      quantity: "",
      unit: "kg",
      farmLocation: "",
      farmerName: "",
      harvestDate: "",
    });
  };

  const pricePerKg = getPricePerKg(form.cropName);
  const quantityKg = parseQuantityKg(form.quantity);
  const estimatedValue = pricePerKg * quantityKg;

  // Batches where farmer has received payment
  const paidBatches = batches
    .map((b) => ({ batch: b, payment: getFarmerPayment(b) }))
    .filter((x) => x.payment !== null) as {
    batch: (typeof batches)[0];
    payment: NonNullable<ReturnType<typeof getFarmerPayment>>;
  }[];

  const totalPaidAmount = paidBatches.reduce(
    (sum, { payment }) => sum + payment.amount,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
              🌾
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Farmer Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your crop batches
              </p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            data-ocid="farmer.register_crop_button"
          >
            <Plus className="w-4 h-4" />
            Register Crop
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {[
            {
              label: "Total Batches",
              value: batches.length,
              icon: <Sprout className="w-4 h-4" />,
            },
            {
              label: "Harvested",
              value: batches.filter((b) => b.status === "harvested").length,
              icon: <Leaf className="w-4 h-4" />,
            },
            {
              label: "In Progress",
              value: batches.filter((b) => b.status !== "delivered").length,
              icon: <Leaf className="w-4 h-4" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                {stat.icon}
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Payment Summary Banner */}
        {paidBatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 rounded-xl border border-green-300 bg-green-50 p-5 shadow-xs"
            data-ocid="farmer.payment_summary.card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h2 className="text-sm font-bold text-green-800 uppercase tracking-wide">
                  Payments Received
                </h2>
              </div>
              <Badge className="bg-green-600 text-white border-0 text-xs">
                Farmer Paid ✅
              </Badge>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-lg px-4 py-3 border border-green-200">
              <span className="text-sm text-green-700 font-medium">
                Total Payments Received
              </span>
              <span className="text-lg font-bold text-green-700 flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                {totalPaidAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Per-batch payments */}
            <div className="space-y-3">
              {paidBatches.map(({ batch, payment }) => (
                <Link
                  key={batch.id}
                  to="/batch/$batchId"
                  params={{ batchId: batch.id }}
                  className="block"
                >
                  <div className="bg-white rounded-lg border border-green-200 p-3 hover:border-green-400 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          {batch.cropName}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {batch.quantity} kg
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-700">
                          Payment Received: ₹
                          {payment.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-green-600">
                          Status: Paid ✅
                        </div>
                      </div>
                    </div>
                    {/* Blockchain verification */}
                    {payment.txHash && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-green-100">
                        <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-[11px] text-primary font-medium">
                          Verified on Blockchain
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                          {truncateHash(payment.txHash)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Batch Grid */}
        {batches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="farmer.batches.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-medium">No batches registered yet.</p>
            <p className="text-sm mt-1">
              Click "Register Crop" to get started.
            </p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch, idx) => (
              <BatchCard key={batch.id} batch={batch} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Register Crop Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="farmer.register_crop.dialog"
          className="max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Register New Crop Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cropName">Crop Name</Label>
                <Input
                  id="cropName"
                  data-ocid="farmer.crop_name.input"
                  placeholder="e.g. Wheat"
                  value={form.cropName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cropName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  data-ocid="farmer.variety.input"
                  placeholder="e.g. Hard Red Winter"
                  value={form.variety}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, variety: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Quantity — unit locked to kg */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="quantity"
                  data-ocid="farmer.quantity.input"
                  type="number"
                  placeholder="2500"
                  min="1"
                  max="100000"
                  step="any"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  required
                  className="flex-1"
                />
                <span className="shrink-0 text-sm font-semibold text-muted-foreground bg-muted px-3 py-2 rounded-md border border-border">
                  kg
                </span>
              </div>

              {/* Live price preview */}
              {form.cropName && quantityKg > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 space-y-0.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Market rate</span>
                    <span className="font-medium text-foreground">
                      ₹{pricePerKg}/kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium text-foreground">
                      {quantityKg.toLocaleString("en-IN")} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-primary/15 mt-1">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      Estimated value
                    </span>
                    <span className="font-bold text-primary">
                      ₹{estimatedValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <Label htmlFor="farmerName">Farmer Name</Label>
              <Input
                id="farmerName"
                data-ocid="farmer.farmer_name.input"
                placeholder="Your full name"
                value={form.farmerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, farmerName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="farmLocation">Farm Location</Label>
              <Input
                id="farmLocation"
                data-ocid="farmer.farm_location.input"
                placeholder="District, State"
                value={form.farmLocation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, farmLocation: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="harvestDate">Harvest Date</Label>
              <Input
                id="harvestDate"
                data-ocid="farmer.harvest_date.input"
                type="date"
                value={form.harvestDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, harvestDate: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="farmer.register_crop.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
                data-ocid="farmer.register_crop.submit_button"
              >
                Register Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
