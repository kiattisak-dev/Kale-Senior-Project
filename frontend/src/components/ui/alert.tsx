import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const alertVariants = cva(
  "relative w-full rounded-md border p-3 sm:p-4 flex items-start gap-3 bg-opacity-90 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border-gray-200 dark:border-gray-700",
        success:
          "border-green-400 text-green-800 bg-green-50 dark:text-green-300 dark:bg-green-900/30",
        error:
          "border-red-400 text-red-800 bg-red-50 dark:text-red-300 dark:bg-red-900/30",
        warning:
          "border-yellow-400 text-yellow-800 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-900/30",
        info: "border-blue-400 text-blue-800 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertBoxProps extends VariantProps<typeof alertVariants> {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

const AlertBox = ({
  type,
  title,
  message,
  className,
  onClose,
}: AlertBoxProps) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const IconComponent = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            alertVariants({ variant: type }),
            "max-w-2xl",
            className
          )}
          role="alert"
        >
          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && (
              <h5 className="text-sm sm:text-base font-medium leading-tight mb-1 truncate">
                {title}
              </h5>
            )}
            <p className="text-xs sm:text-sm leading-relaxed truncate">
              {message}
            </p>
          </div>
          {onClose && (
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-2"
              aria-label="Close alert"
            >
              <X className="h-4 w-4 opacity-60" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { AlertBox, alertVariants };
