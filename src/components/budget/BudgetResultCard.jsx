import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/pricingData";

const FEASIBILITY_CONFIG = {
  ideal: { label: "Ideal", color: "text-green-600 bg-green-50 border-green-200" },
  possible: { label: "Posible", color: "text-blue-600 bg-blue-50 border-blue-200" },
  limited: { label: "Limitado", color: "text-amber-600 bg-amber-50 border-amber-200" },
  not_recommended: { label: "No recomendado", color: "text-red-500 bg-red-50 border-red-200" },
};

export default function BudgetResultCard({ sys, isRecommended, Icon, index }) {
  const feasibility = FEASIBILITY_CONFIG[sys.feasibility] ?? FEASIBILITY_CONFIG.possible;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-card rounded-xl p-5 border transition-all ${
        isRecommended
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-primary/30"
      }`}
    >
      {isRecommended && (
        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Recomendado para tu presupuesto
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRecommended ? "bg-primary/15" : "bg-secondary"}`}>
          <Icon className={`w-5 h-5 ${isRecommended ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="font-bold text-base">{sys.system_name}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${feasibility.color}`}>
            {feasibility.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Podés construir</div>
          <div className="font-bold text-primary text-lg">{Math.round(sys.buildable_m2)} m²</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Inversión total</div>
          <div className="font-bold text-sm">{formatCurrency(sys.total_cost)}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{sys.note}</p>
    </motion.div>
  );
}