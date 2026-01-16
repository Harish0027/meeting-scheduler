import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-neutral-900 bg-neutral-900 text-white focus:ring-neutral-900",
        secondary:
          "border-neutral-200 bg-neutral-100 text-neutral-900 focus:ring-neutral-900",
        destructive:
          "border-red-200 bg-red-100 text-red-900 focus:ring-red-900",
        outline:
          "border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
