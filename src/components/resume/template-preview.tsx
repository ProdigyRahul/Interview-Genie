import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { ModernResume } from "./templates/modern";
import { ClassicResume } from "./templates/classic";
import { MinimalistResume } from "./templates/minimalist";

interface TemplatePreviewProps {
  template: "modern" | "classic" | "minimalist";
  data: ResumeData;
  className?: string;
}

export function TemplatePreview({ template, data, className }: TemplatePreviewProps) {
  const TemplateComponent = {
    modern: ModernResume,
    classic: ClassicResume,
    minimalist: MinimalistResume,
  }[template];

  return (
    <div className={cn(
      "w-full max-w-[210mm] mx-auto bg-white text-black",
      "p-8 shadow-lg print:shadow-none dark:ring-1 dark:ring-white/10",
      className
    )}>
      <TemplateComponent data={data} />
    </div>
  );
} 