import { cn } from "@/shadcn/lib/utils";

const DEFAULT_PHOTO_CREDIT = "Foto: Igor Kralj / PIXSELL";

interface PhotoCreditProps {
  className?: string;
  text?: string;
}

export function PhotoCredit({
  className,
  text = DEFAULT_PHOTO_CREDIT,
}: PhotoCreditProps) {
  return (
    <div className={cn("container mx-auto px-global pt-2", className)}>
      <p className="text-left text-[12px] leading-tight text-muted-foreground/70 md:text-[13px]">
        {text}
      </p>
    </div>
  );
}
