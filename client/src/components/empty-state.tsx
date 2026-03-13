import { motion } from "framer-motion";
import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted max-w-lg mx-auto"
    >
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-primary/40" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" />
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}
