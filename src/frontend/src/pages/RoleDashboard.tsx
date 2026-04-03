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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Clock, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BatchCard } from "../components/BatchCard";
import { useSupplyChain } from "../context/SupplyChainContext";
import { ROLE_CONFIG, STAGE_ORDER } from "../lib/supply-chain-types";
import type { UserRole } from "../lib/supply-chain-types";

interface RoleDashboardProps {
  role: UserRole;
}

export function RoleDashboard({ role }: RoleDashboardProps) {
  const { batches, addUpdate, advanceStage } = useSupplyChain();
  const config = ROLE_CONFIG[role];

  const roleIdx = STAGE_ORDER.indexOf(role);
  const prevStage = roleIdx > 0 ? STAGE_ORDER[roleIdx - 1] : null;

  const [updateDialog, setUpdateDialog] = useState<string | null>(null);
  const [updateForm, setUpdateForm] = useState({
    action: config.actions[0],
    details: "",
    location: "",
    handler: "",
    notes: "",
  });

  // Show batches at this role's stage, waiting at previous stage (pending pickup),
  // or that have already passed through this role (historical).
  const relevantBatches = batches.filter(
    (b) =>
      b.currentStage === role ||
      b.currentStage === prevStage ||
      b.updates.some((u) => u.stage === role),
  );

  const activeBatches = batches.filter(
    (b) => b.currentStage === role || b.currentStage === prevStage,
  );

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateDialog) return;
    addUpdate(updateDialog, {
      stage: role,
      action: updateForm.action,
      details: updateForm.details,
      location: updateForm.location,
      handler: updateForm.handler,
      notes: updateForm.notes || undefined,
    });
    setUpdateDialog(null);
    setUpdateForm({
      action: config.actions[0],
      details: "",
      location: "",
      handler: "",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
              {config.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {config.label} Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeBatches.length} active \u00b7 {relevantBatches.length}{" "}
                total batches
              </p>
            </div>
          </div>
        </motion.div>

        {relevantBatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid={`${role}.batches.empty_state`}
            className="text-center py-16 text-muted-foreground"
          >
            <div className="text-5xl mb-4">{config.icon}</div>
            <p className="font-medium">No batches assigned to your role yet.</p>
            <p className="text-sm mt-1">
              Check back once batches are in your stage.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {relevantBatches.map((batch, idx) => {
              const isAtMyStage = batch.currentStage === role;
              const isPendingPickup = batch.currentStage === prevStage;
              const canAct = isAtMyStage || isPendingPickup;
              return (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <BatchCard batch={batch} index={idx} />
                      {isPendingPickup && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                          <Clock className="w-3 h-3" />
                          Awaiting pickup from{" "}
                          {ROLE_CONFIG[batch.currentStage].label}
                        </div>
                      )}
                    </div>
                    {canAct && (
                      <div className="flex sm:flex-col gap-2 sm:w-36">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-initial gap-1 text-xs border-primary/40 text-primary hover:bg-primary/5"
                          onClick={() => setUpdateDialog(batch.id)}
                          data-ocid={`${role}.add_update.button.${idx + 1}`}
                        >
                          <Plus className="w-3 h-3" />
                          Add Update
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-initial gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => advanceStage(batch.id)}
                          data-ocid={`${role}.advance_stage.button.${idx + 1}`}
                        >
                          {isPendingPickup ? "Pick Up" : "Advance"}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!updateDialog}
        onOpenChange={(o) => !o && setUpdateDialog(null)}
      >
        <DialogContent
          data-ocid={`${role}.add_update.dialog`}
          className="max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Add Update \u2014 {config.label}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUpdate} className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select
                value={updateForm.action}
                onValueChange={(v) =>
                  setUpdateForm((p) => ({ ...p, action: v }))
                }
              >
                <SelectTrigger data-ocid={`${role}.action.select`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                data-ocid={`${role}.details.textarea`}
                placeholder="Describe what happened..."
                value={updateForm.details}
                onChange={(e) =>
                  setUpdateForm((p) => ({ ...p, details: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  data-ocid={`${role}.location.input`}
                  placeholder="City, State"
                  value={updateForm.location}
                  onChange={(e) =>
                    setUpdateForm((p) => ({ ...p, location: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="handler">Handler</Label>
                <Input
                  id="handler"
                  data-ocid={`${role}.handler.input`}
                  placeholder="Your name"
                  value={updateForm.handler}
                  onChange={(e) =>
                    setUpdateForm((p) => ({ ...p, handler: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                data-ocid={`${role}.notes.input`}
                placeholder="Additional notes..."
                value={updateForm.notes}
                onChange={(e) =>
                  setUpdateForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUpdateDialog(null)}
                data-ocid={`${role}.add_update.cancel_button`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
                data-ocid={`${role}.add_update.submit_button`}
              >
                Save Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
