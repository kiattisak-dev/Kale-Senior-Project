import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Leaf, Zap, ChartBar, Shield } from "lucide-react"; // Import Lucide icons

export const HoverEffect = ({
  items,
  className,
}: {
  items: { title: string; description: string; link: string; icon: React.ReactNode }[]; // Change type to React.ReactNode
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10", className)}>
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <Icon>{item.icon}</Icon> 
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Icon = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4", className)}>
      <div className="w-15 h-15 text-green-600 dark:text-green-400">
        <div className="relative z-50">
          <div className="p-4">{children}</div> 
        </div>
      </div>
    </div>
  );
};


export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "p-6 h-full w-full overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-green-100 dark:border-green-900  transition-transform duration-300 border-transparent",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <h3 className={cn("text-xl font-semibold text-gray-900 dark:text-white mb-2", className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <p className={cn("mt-4 text-zinc-400 tracking-wide leading-relaxed text-sm", className)}>
      {children}
    </p>
  );
};
