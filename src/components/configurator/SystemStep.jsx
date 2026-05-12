import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CONSTRUCTION_SYSTEMS, formatCurrency, getEstimatedMonths, getSystemCostPerM2 } from "@/lib/pricingData";
// SystemStep shows only the 3 main systems (traditional, steel_frame, mixed)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Clock, ThumbsUp, ThumbsDown, Info, Box, Container, TreePine, LayoutGrid, Building } from "lucide-react";

const iconMap = {
  Brick: Box,
  Container: Container,
  TreePine: TreePine,
  LayoutGrid: LayoutGrid,
  Building: Building,
};

export default function SystemStep({ selectedSystem, area, onSystemChange, onNext, onBack }) {
  // Only show the 3 main construction systems (obra gris variants are handled separately)
  const systems = Object.values(CONSTRUCTION_SYSTEMS).filter(s => !s.isShell);

  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: () => base44.entities.BuildConfig.list("-created_date", 500),
    staleTime: 60_000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">
          Sistema constructivo
        </h2>
        <p className="text-muted-foreground">
          Elige el sistema que mejor se adapte a tu proyecto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map((system) => {
          const isSelected = selectedSystem === system.key;
          const Icon = iconMap[system.icon] || LayoutGrid;
          const costPerM2 = getSystemCostPerM2(system.key, dbConfigs);
          const estimatedCost = area * costPerM2;
          const months = getEstimatedMonths(system.key, area, dbConfigs);

          return (
            <div key={system.key} className="relative">
              <motion.button
                type="button"
                onClick={() => onSystemChange(system.key)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full relative p-6 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{system.label}</div>
                      <div className="text-sm text-muted-foreground">{system.subtitle}</div>
                    </div>
                  </div>
                  {/* Spacer to keep tooltip button out of the main button */}
                  <div className="w-8 h-8" />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {system.description}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Estructura desde</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(estimatedCost)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      ~{months} meses
                    </Badge>
                    <Badge variant="outline">
                      Desde {formatCurrency(costPerM2)}/m²
                    </Badge>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-10 w-3 h-3 rounded-full bg-primary" />
                )}
              </motion.button>

              {/* Tooltip — outside the main button to avoid nested button issues */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-secondary z-10"
                    >
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-accent font-medium mb-1">
                          <ThumbsUp className="w-3.5 h-3.5" /> Ventajas
                        </div>
                        <ul className="text-xs space-y-0.5">
                          {system.advantages.map(a => <li key={a}>• {a}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-destructive font-medium mb-1">
                          <ThumbsDown className="w-3.5 h-3.5" /> Desventajas
                        </div>
                        <ul className="text-xs space-y-0.5">
                          {system.disadvantages.map(d => <li key={d}>• {d}</li>)}
                        </ul>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pb-20 lg:pb-0">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button onClick={onNext} size="lg" className="gap-2 px-8" disabled={!selectedSystem}>
          Siguiente <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}