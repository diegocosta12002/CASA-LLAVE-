import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { calculateTotal, formatCurrency, ALL_SYSTEMS, calculateFloorsCost } from "@/lib/pricingData";
import { calculateStagesCost, BATHROOM_CONFIG } from "@/lib/constructionStages";
import { Hammer, PaintBucket, Wrench, FileCheck, TrendingUp, Users, MapPin } from "lucide-react";
import { LOCATION_TYPES } from "@/lib/constructionStages";

// Approximate labor vs material split by system
const LABOR_RATIO = {
  traditional:          0.40,
  steel_frame:          0.35,
  mixed:                0.38,
  obra_gris_traditional: 0.45,
  obra_gris_steel:      0.40,
  obra_gris_mixed:      0.42,
};

export default function BudgetBreakdownCard({ area, system, stageSelections, floors }) {
  const sel = stageSelections || {};

  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: async () => { const { data } = await supabase.from("build_config").select("*"); return data || []; },
    staleTime: 60_000,
  });

  const baseResult = useMemo(
    () => calculateTotal(area, system, "simple", "standard", {}, dbConfigs, floors),
    [area, system, dbConfigs, floors]
  );

  const bathConfig = useMemo(
    () => BATHROOM_CONFIG.find(b => b.key === sel.bathroom),
    [sel.bathroom]
  );

  const stagesResult = useMemo(
    () => calculateStagesCost(sel, area, system, bathConfig, dbConfigs),
    [sel, area, system, bathConfig, dbConfigs]
  );

  const grandTotal = baseResult.total + stagesResult.total;
  const laborRatioRec = dbConfigs.find(c => c.config_key === `labor_ratio_${system}`);
  const laborRatio = laborRatioRec ? laborRatioRec.value / 100 : (LABOR_RATIO[system] ?? 0.40);
  const systemInfo = ALL_SYSTEMS[system];

  const structure = baseResult.breakdown.structure || 0;
  const finishes  = baseResult.breakdown.finishes  || 0;
  const extras_   = baseResult.breakdown.extras    || 0;

  // Separate location cost from stages
  const locationCost = stagesResult.items?.location || 0;
  const foundationCost = stagesResult.items?.foundation || 0;
  const stagesWithoutLocationAndFoundation = (stagesResult.total || 0) - locationCost - foundationCost;

  // Location label
  const selectedLocation = LOCATION_TYPES.find(l => l.key === sel.location);
  const locationLabel = locationCost > 0 ? formatCurrency(locationCost) : "Sin adicional";

  const laborTotal    = Math.round(grandTotal * laborRatio);
  const materialTotal = grandTotal - laborTotal;

  const rows = [
    { icon: Hammer,      label: "Estructura base",         amount: structure + foundationCost, color: "text-orange-600" },
    { icon: PaintBucket, label: "Terminaciones base",       amount: finishes,                  color: "text-blue-600" },
    { icon: Wrench,      label: "Instalaciones/etapas",     amount: stagesWithoutLocationAndFoundation, color: "text-green-600" },
    { icon: FileCheck,   label: "Permisos y conexiones",    amount: extras_,                   color: "text-purple-600" },
    { icon: MapPin,      label: "Lugar de construcción",    amount: locationCost,              color: "text-rose-600", customValue: locationLabel },
  ];

  return (
    <motion.div
      key={grandTotal}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Resumen de presupuesto</h3>
        <span className="text-xs text-muted-foreground">{area} m² · {systemInfo?.label}</span>
      </div>

      {/* Desglose de costos */}
      <div className="space-y-1.5">
        {rows.map(({ icon: Icon, label, amount, color, customValue }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className={`w-3 h-3 ${color}`} /> {label}
            </span>
            <span className="font-semibold tabular-nums">{customValue ?? formatCurrency(amount)}</span>
          </div>
        ))}
      </div>

      {/* Barra progreso acumulada */}
      <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
        {rows.map(({ label, amount }, i) => {
          const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
          const barColors = ["bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-rose-500"];
          return (
            <div key={label} className={`${barColors[i]} h-full transition-all duration-500`} style={{ width: `${pct}%` }} />
          );
        })}
      </div>

      {/* Mano de obra vs Materiales */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-0.5">
            <Users className="w-3 h-3" />
            <span className="text-[10px] font-medium">Mano de obra</span>
          </div>
          <div className="text-sm font-bold text-orange-700">{formatCurrency(laborTotal)}</div>
          <div className="text-[10px] text-orange-500">{Math.round(laborRatio * 100)}% del total</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
            <Hammer className="w-3 h-3" />
            <span className="text-[10px] font-medium">Materiales</span>
          </div>
          <div className="text-sm font-bold text-blue-700">{formatCurrency(materialTotal)}</div>
          <div className="text-[10px] text-blue-500">{Math.round((1 - laborRatio) * 100)}% del total</div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t pt-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <TrendingUp className="w-4 h-4 text-primary" /> Total estimado
        </span>
        <div className="text-right">
          <motion.div
            key={grandTotal}
            initial={{ scale: 1.1, color: "#b45309" }}
            animate={{ scale: 1, color: "hsl(var(--primary))" }}
            className="text-xl font-bold text-primary font-display leading-none"
          >
            {formatCurrency(grandTotal)}
          </motion.div>
          {area > 0 && grandTotal > 0 && (
            <motion.div
              key={`pm2-${grandTotal}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground mt-0.5"
            >
              {formatCurrency(Math.round(grandTotal / area))}/m²
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}