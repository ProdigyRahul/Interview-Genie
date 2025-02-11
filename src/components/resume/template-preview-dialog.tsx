import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateType } from "@/lib/types/resume";
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
  const [previewData, setPreviewData] = useState(sampleData);
  const [isLoading, setIsLoading] = useState(false);

  const TemplateComponent = {
    modern: ModernResume,
    classic: ClassicResume,
    minimalist: MinimalistResume
  }[template];

  const fetchPreviewData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resumes/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preview data');
      }

      const { data } = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error('Error fetching preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch preview data when dialog opens
  useEffect(() => {
    if (isOpen) {
      void fetchPreviewData();
    }
  }, [isOpen, template, fetchPreviewData]);

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
            {isLoading ? (
              <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <TemplateComponent data={previewData} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 