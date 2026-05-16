import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { calculateTotal, formatCurrency, CONSTRUCTION_SYSTEMS, FINISH_TIERS, getEstimatedMonths } from "@/lib/pricingData";
import { calculateStagesCost, BATHROOM_CONFIG } from "@/lib/constructionStages";
import { Clock, TrendingUp } from "lucide-react";
import BudgetBreakdownCard from "@/components/configurator/BudgetBreakdownCard";

export default function PriceSidebar({ area, system, finishMode, finishTier, finishDetails, stageSelections, floors }) {
  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: async () => { const { data } = await supabase.from("build_config").select("*"); return data || []; },
    staleTime: 60_000,
  });
  const estimatedMonths = getEstimatedMonths(system, area, dbConfigs);

  return (
    <div className="space-y-4 sticky top-24">
      <BudgetBreakdownCard area={area} system={system} stageSelections={stageSelections} floors={floors} />

      <div className="bg-card border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Tiempo est.</span>
          <span className="font-medium">~{estimatedMonths} meses</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" /> Financiación</span>
          <a href="https://www.tobycoconstructora.com.ar" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline hover:text-primary/80">Ver opciones</a>
        </div>
      </div>
    </div>
  );
}