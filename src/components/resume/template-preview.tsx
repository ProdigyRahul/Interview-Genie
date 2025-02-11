import { ResumeData, TemplateType } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { ModernResume } from "./templates/modern";
import { ClassicResume } from "./templates/classic";
import { MinimalistResume } from "./templates/minimalist";
import { sampleData } from "@/lib/templates/preview-generator";

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
    <div className={cn(
      "relative w-full aspect-[210/297] bg-white text-black rounded-lg overflow-hidden cursor-pointer",
      "border-2 transition-all hover:border-primary hover:shadow-lg",
      isSelected ? "border-primary shadow-lg" : "border-border",
      className
    )}>
      {/* Template Preview */}
      <div className="absolute inset-0 scale-[0.15] origin-top-left">
        <TemplateComponent data={sampleData} />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/50">
        <button
          onClick={() => onSelect(template)}
          className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100"
        >
          Select
        </button>
        <button
          onClick={onPreview}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Preview
        </button>
      </div>
    </div>
  );
} 