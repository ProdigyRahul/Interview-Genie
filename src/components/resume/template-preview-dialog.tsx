import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateType } from "@/lib/templates/latex/types";
import { X, Loader2 } from "lucide-react";

interface TemplatePreviewDialogProps {
  template: TemplateType;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePreviewDialog({ template, isOpen, onClose }: TemplatePreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPdfUrl(null);
      setLoading(true);
      setError(null);

      // Generate preview URL
      const previewUrl = `/api/resumes/templates/preview?template=${template}`;
      setPdfUrl(previewUrl);
      setLoading(false);
    }
  }, [isOpen, template]);

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
          <div className="aspect-[210/297] bg-muted">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-destructive">
                {error}
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title={`${template} template preview`}
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 