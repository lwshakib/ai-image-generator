"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProModal } from "@/hooks/use-pro-modal";
import { PricingTable } from "@clerk/nextjs";
import { useState } from "react";

export const ProModal = () => {
  const proModal = useProModal();
  const [loadingStarter, setLoadingStarter] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  // UI-only: Simulate loading for 1 second
  const handleStarterClick = () => {
    setLoadingStarter(true);
    setTimeout(() => setLoadingStarter(false), 1000);
  };
  const handleProClick = () => {
    setLoadingPro(true);
    setTimeout(() => setLoadingPro(false), 1000);
  };

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            Upgrade
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Unlock More Features</h2>
            <p className="text-gray-600 mb-4">
              Upgrade your plan to access premium tools, higher limits, and
              priority support. Choose the plan that best fits your needs below.
            </p>
          </div>
          <div className="mt-8">
            <PricingTable />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
