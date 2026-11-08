import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  width?: "reading" | "wide" | "archive" | "form";
  className?: string;
}

const WIDTH_CLASSES: Record<NonNullable<PageContainerProps["width"]>, string> = {
  reading: "max-w-[820px]",
  wide: "max-w-[1160px]",
  archive: "max-w-[1080px]",
  form: "max-w-[640px]",
};

export function PageContainer({
  children,
  width = "reading",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-x-clip mx-auto px-4 sm:px-6 pb-28 pt-6 sm:pt-8 font-sans",
        WIDTH_CLASSES[width],
        className
      )}
    >
      {children}
    </div>
  );
}
