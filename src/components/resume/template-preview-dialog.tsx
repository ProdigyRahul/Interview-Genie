import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateType } from "@/lib/templates/latex/types";
import { X } from "lucide-react";
import { ModernResume } from "./templates/modern";
import { ClassicResume } from "./templates/classic";
import { MinimalistResume } from "./templates/minimalist";
import { sampleData } from "@/lib/templates/preview-generator";

interface TemplatePreviewDialogProps {
  template: TemplateType;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePreviewDialog({ template, isOpen, onClose }: TemplatePreviewDialogProps) {
  const TemplateComponent = {
    modern: ModernResume,
    classic: ClassicResume,
    minimalist: MinimalistResume
  }[template];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Preview Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            <TemplateComponent data={sampleData} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 