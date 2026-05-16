import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { OBRA_GRIS_SYSTEMS, formatCurrency, getEstimatedMonths, getSystemCostPerM2 } from "@/lib/pricingData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Clock, ThumbsUp, ThumbsDown, Info, Key, Layers3, Box, Container, LayoutGrid } from "lucide-react";

const iconMap = {
  Brick: Box,
  Container: Container,
  LayoutGrid: LayoutGrid,
};

export default function ModalityStep({ modality, obraGrisSystem, onModalityChange, onObraGrisSystemChange, area, onNext, onBack }) {
  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: async () => { const { data } = await supabase.from("build_config").select("*"); return data || []; },
    staleTime: 60_000,
  });

  const canContinue =
    modality === "llave_en_mano" ||
    (modality === "obra_gris" && obraGrisSystem);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">
          ¿Cómo querés construir?
        </h2>
        <p className="text-muted-foreground">
          Elegí la modalidad que mejor se adapta a tu presupuesto y tiempos
        </p>
      </div>

      {/* Modalidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Llave en mano */}
        <motion.button
          type="button"
          onClick={() => onModalityChange("llave_en_mano")}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
            modality === "llave_en_mano"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border bg-card hover:border-primary/40 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              modality === "llave_en_mano" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">Llave en Mano</div>
              <div className="text-xs text-muted-foreground">Casa terminada para habitar</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Entregamos tu casa completamente terminada: estructura, instalaciones, terminaciones, carpintería y pintura.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">✓ Terminaciones completas</Badge>
            <Badge variant="secondary" className="text-xs">✓ Lista para habitar</Badge>
          </div>
          {modality === "llave_en_mano" && (
            <div className="mt-3 w-3 h-3 rounded-full bg-primary" />
          )}
        </motion.button>

        {/* Obra Gris */}
        <motion.button
          type="button"
          onClick={() => onModalityChange("obra_gris")}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
            modality === "obra_gris"
              ? "border-accent bg-accent/5 shadow-lg"
              : "border-border bg-card hover:border-accent/40 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              modality === "obra_gris" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              <Layers3 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">Obra Gris</div>
              <div className="text-xs text-muted-foreground">Estructura + instalaciones básicas</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Solo la estructura, revoques e instalaciones básicas. Terminás vos los detalles en etapas. Opción más económica.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs text-accent border-accent/40">↓ Menor inversión inicial</Badge>
            <Badge variant="outline" className="text-xs text-accent border-accent/40">↓ Sin terminaciones</Badge>
          </div>
          {modality === "obra_gris" && (
            <div className="mt-3 w-3 h-3 rounded-full bg-accent" />
          )}
        </motion.button>
      </div>

      {/* Si eligió Obra Gris, elegir el subsistema */}
      {modality === "obra_gris" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">Elegí el sistema estructural</h3>
            <p className="text-sm text-muted-foreground">¿Con qué sistema querés construir tu obra gris?</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Object.values(OBRA_GRIS_SYSTEMS).map((sys) => {
              const isSelected = obraGrisSystem === sys.key;
              const Icon = iconMap[sys.icon] || LayoutGrid;
              const costPerM2 = getSystemCostPerM2(sys.key, dbConfigs);
              const estimatedCost = area * costPerM2;
              const months = getEstimatedMonths(sys.key, area, dbConfigs);

              return (
                <div key={sys.key} className="relative">
                  <motion.button
                    type="button"
                    onClick={() => onObraGrisSystemChange(sys.key)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/5 shadow-md"
                        : "border-border bg-card hover:border-accent/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold">{sys.label}</div>
                          <div className="text-xs text-muted-foreground">{sys.subtitle}</div>
                        </div>
                      </div>
                      <div className="w-7" />
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 mb-3">{sys.description}</p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Estructura desde</div>
                        <div className="text-base font-bold text-accent">{formatCurrency(estimatedCost)}</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Clock className="w-3 h-3" />~{months} meses
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(costPerM2)}/m²
                        </Badge>
                      </div>
                    </div>

                    {isSelected && <div className="absolute top-3 right-10 w-3 h-3 rounded-full bg-accent" />}
                  </motion.button>

                  {/* Tooltip */}
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
                              {sys.advantages.map(a => <li key={a}>• {a}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-destructive font-medium mb-1">
                              <ThumbsDown className="w-3.5 h-3.5" /> Desventajas
                            </div>
                            <ul className="text-xs space-y-0.5">
                              {sys.disadvantages.map(d => <li key={d}>• {d}</li>)}
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
        </motion.div>
      )}

      <div className="flex justify-between pb-20 lg:pb-0">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button onClick={onNext} size="lg" className="gap-2 px-8" disabled={!canContinue}>
          Siguiente <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}