import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  width?: "reading" | "wide" | "archive" | "form";
  className?: string;
}

const WIDTH_CLASSES: Record<NonNullable<PageContainerProps["width"]>, string> = {
  reading: "max-w-[768px]",
  wide: "max-w-[1200px]",
  archive: "max-w-[1064px]",
  form: "max-w-[600px]",
};

export function PageContainer({
  children,
  width = "reading",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 pb-24 pt-6 font-sans",
        WIDTH_CLASSES[width],
        className
      )}
    >
      {children}
    </div>
  );
}
