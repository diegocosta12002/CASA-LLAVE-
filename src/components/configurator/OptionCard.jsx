import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/pricingData";

export default function OptionCard({ option, isSelected, onClick, showCost = true, costLabel = null }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={`relative p-4 rounded-xl border-2 text-left transition-all w-full ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      <div className="font-semibold text-sm">{option.label}</div>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{option.description}</p>
      {showCost && costLabel && (
        <div className="mt-2 text-xs font-medium text-primary">{costLabel}</div>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </motion.button>
  );
}