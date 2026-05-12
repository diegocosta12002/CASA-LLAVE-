import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";

export default function SavingsTipCard({ tip, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-4 bg-card border rounded-xl p-5 hover:shadow-sm transition-shadow"
    >
      <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
        <TrendingDown className="w-4 h-4 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-semibold text-sm">{tip.title}</div>
          {tip.potential_saving_pct > 0 && (
            <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0 whitespace-nowrap">
              -{tip.potential_saving_pct}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
      </div>
    </motion.div>
  );
}