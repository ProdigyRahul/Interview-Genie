import { ResumeData, TemplateType } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { ModernResume } from "./templates/modern";
import { ClassicResume } from "./templates/classic";
import { MinimalistResume } from "./templates/minimalist";
import { sampleData } from "@/lib/templates/preview-generator";
import { Eye, Check } from "lucide-react";

interface TemplatePreviewProps {
  template: TemplateType;
  isSelected: boolean;
  onSelect: (template: TemplateType) => void;
  onPreview: () => void;
  className?: string;
}

export function TemplatePreview({ template, isSelected, onSelect, onPreview, className }: TemplatePreviewProps) {
  const TemplateComponent = {
    modern: ModernResume,
    classic: ClassicResume,
    minimalist: MinimalistResume,
  }[template];

  return (
    <div 
      onClick={() => onSelect(template)}
      className={cn(
        "group relative w-full aspect-[210/297] bg-white text-black rounded-lg overflow-hidden cursor-pointer",
        "transition-all duration-300 ease-out hover:scale-[1.02]",
        "ring-2",
        isSelected ? [
          "ring-primary shadow-2xl shadow-primary/20",
          "after:absolute after:inset-0 after:z-10",
          "after:bg-gradient-to-br after:from-primary/20 after:via-primary/10 after:to-transparent",
        ] : [
          "ring-border/50 hover:ring-primary/50",
          "hover:shadow-xl hover:shadow-primary/10",
        ],
        className
      )}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-white font-medium animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>Selected</span>
        </div>
      )}

      {/* Template Preview Container */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Template Preview with improved scaling */}
        <div className="absolute inset-0" style={{ 
          transform: 'scale(0.31)',
          transformOrigin: 'top center',
          width: '325%',
          height: '325%',
          left: '-112.5%'
        }}>
          <div className="w-full h-full">
            <TemplateComponent data={sampleData} />
          </div>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 z-20 transition-opacity duration-300",
        "opacity-0 group-hover:opacity-100",
        "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
      )} />

      {/* Preview Button Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center",
        "opacity-0 group-hover:opacity-100 transition-all duration-300",
        "bg-gradient-to-b from-black/30 via-black/20 to-black/30 backdrop-blur-[2px] z-30",
        isSelected && "bg-opacity-50"
      )}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full",
            "bg-gradient-to-r from-primary to-primary/90",
            "text-primary-foreground shadow-lg text-base font-medium",
            "transform transition-all duration-300",
            "hover:scale-105 hover:shadow-primary/25",
            "active:scale-95"
          )}
        >
          <Eye className="w-5 h-5" />
          <span>Preview</span>
        </button>
      </div>

      {/* Template Label */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-3 z-40",
        "bg-gradient-to-t from-black/90 to-transparent",
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        "transition-all duration-300"
      )}>
        <span className="text-white font-medium capitalize">
          {template} Template
        </span>
      </div>

      {/* Selection Indicator Border */}
      {isSelected && (
        <div className="absolute inset-0 z-20 rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background" />
      )}
    </div>
  );
} 