import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, MapPin, Package, Search, ShieldCheck, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSupplyChain } from "../context/SupplyChainContext";
import { ROLE_CONFIG } from "../lib/supply-chain-types";

export function ConsumerDashboard() {
  const { batches } = useSupplyChain();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [scanInput, setScanInput] = useState("");

  const filtered = batches.filter(
    (b) =>
      b.cropName.toLowerCase().includes(search.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      b.farmLocation.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = scanInput.trim();
    if (trimmed) {
      navigate({ to: "/scan/$batchId", params: { batchId: trimmed } });
    }
  };

  const stageLabel = (stage: string) =>
    ROLE_CONFIG[stage as keyof typeof ROLE_CONFIG]?.label ?? stage;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-agri-green text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h1 className="text-xl font-bold">Consumer Dashboard</h1>
              <p className="text-white/70 text-sm">
                Browse all registered crops and verify their supply chain
                journey
              </p>
            </div>
          </motion.div>

          {/* Scan by ID */}
          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onSubmit={handleScan}
            className="flex gap-2"
          >
            <Input
              data-ocid="consumer.scan_input"
              placeholder="Enter Batch ID to scan (e.g. AGR-DEMO01-A1B2)"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
            />
            <Button
              type="submit"
              className="bg-white text-primary hover:bg-white/90 font-semibold gap-2"
              data-ocid="consumer.scan_button"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify
            </Button>
          </motion.form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="consumer.search_input"
            placeholder="Search by crop, farmer, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </motion.div>

        {/* Batch Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} batch{filtered.length !== 1 ? "es" : ""} available
        </p>

        {/* Batch List */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-muted-foreground"
            data-ocid="consumer.empty_state"
          >
            <div className="text-5xl mb-4">🌾</div>
            <p className="font-medium">No batches found.</p>
            <p className="text-sm mt-1">
              Try a different search or scan a QR code.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((batch, idx) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
                data-ocid={`consumer.batch_card.${idx + 1}`}
              >
                <div className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        {batch.cropName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {batch.variety}
                      </p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground text-xs shrink-0">
                      {batch.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Package className="w-3 h-3" />
                      {batch.quantity} {batch.unit}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <User className="w-3 h-3" />
                      {batch.farmerName}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <MapPin className="w-3 h-3" />
                      {batch.farmLocation}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Leaf className="w-3 h-3" />
                      Stage: {stageLabel(batch.currentStage)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-mono">
                      {batch.id}
                    </p>
                    <Link
                      to="/scan/$batchId"
                      params={{ batchId: batch.id }}
                      data-ocid={`consumer.view_journey.${idx + 1}`}
                    >
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        View Journey
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
