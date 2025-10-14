import { cn } from "@/lib/utils";
import './Skeleton.css';

function Skeleton({ className, animation=true, ...props }) {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-sm rounded-lg",
        animation ? "shimmer-effect" : "",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
