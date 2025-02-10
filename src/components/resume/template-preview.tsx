import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemplateType } from "@/lib/templates/latex/types";
import { FileText, Check } from "lucide-react";

interface TemplatePreviewProps {
  template: TemplateType;
  isSelected: boolean;
  onSelect: (template: TemplateType) => void;
  onPreview: () => void;
  className?: string;
}

const templateDetails: Record<TemplateType, { title: string; description: string }> = {
  modern: {
    title: "Modern Template",
    description: "A contemporary design with a clean layout and subtle color accents"
  },
  classic: {
    title: "Classic Template",
    description: "A traditional format perfect for conservative industries"
  },
  minimalist: {
    title: "Minimalist Template",
    description: "A sleek, minimal design focusing on essential information"
  }
};

export function TemplatePreview({ template, isSelected, onSelect, onPreview, className }: TemplatePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const details = templateDetails[template];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer group",
        isSelected ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50",
        className
      )}
      onClick={() => onSelect(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 space-y-4">
        <div className="aspect-[210/297] relative bg-muted rounded-lg overflow-hidden">
          {/* Template Preview Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
          </div>
          
          {/* Template Preview Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-primary/10 flex items-center justify-center transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <Button 
              variant="secondary" 
              className="shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
            >
              Preview
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{details.title}</h3>
            {isSelected && (
              <Check className="h-5 w-5 text-primary animate-in zoom-in" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {details.description}
          </p>
        </div>
      </div>
    </Card>
  );
} 