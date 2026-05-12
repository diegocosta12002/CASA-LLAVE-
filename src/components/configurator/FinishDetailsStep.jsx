import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, PaintBucket } from "lucide-react";
import {
  FLOORING_TYPES, KITCHEN_COUNTERTOP, KITCHEN_CABINETS,
  WALL_CLADDING, WINDOW_TYPES, BATHROOM_CLADDING, HEATING_TYPES, ELECTRICAL_TYPES, WOODWORK_TYPES
} from "@/lib/constructionStages";
import { formatCurrency } from "@/lib/pricingData";
import { useDbConfigs, mergeWithDb } from "@/hooks/useDbConfigs";
import StageSection from "./StageSection";

export default function FinishDetailsStep({ selections, onChange, area, onNext, onBack }) {
  const update = (key, val) => onChange({ ...selections, [key]: val });
  const { dbConfigs } = useDbConfigs();

  const flooringOpts    = mergeWithDb(FLOORING_TYPES,      "flooring_",      "costPerM2", dbConfigs);
  const bathCladdingOpts= mergeWithDb(BATHROOM_CLADDING,   "bath_cladding_", "costPerM2", dbConfigs);
  const countertopOpts  = mergeWithDb(KITCHEN_COUNTERTOP,  "countertop_",    "costAdd",   dbConfigs);
  const cabinetsOpts    = mergeWithDb(KITCHEN_CABINETS,    "cabinets_",      "costAdd",   dbConfigs);
  const wallCladdingOpts= mergeWithDb(WALL_CLADDING,       "wall_cladding_", "costPerM2", dbConfigs);
  const windowOpts      = mergeWithDb(WINDOW_TYPES,        "windows_",       "costPerM2", dbConfigs);
  const heatingOpts     = mergeWithDb(HEATING_TYPES,       "heating_",       "costAdd",   dbConfigs);
  const woodworkOpts    = mergeWithDb(WOODWORK_TYPES,      "woodwork_",      "costAdd",   dbConfigs);
  const electricalOpts  = mergeWithDb(ELECTRICAL_TYPES,    "electrical_",    "costAdd",   dbConfigs);

  const selectedWall = wallCladdingOpts.find(w => w.key === selections.wallCladding);
  const wallM2 = selections.wallCladdingM2 || Math.round(area * 0.4);

  const isComplete =
    selections.flooring &&
    selections.countertop &&
    selections.cabinets &&
    selections.wallCladding &&
    selections.windows &&
    selections.bathroomCladding &&
    selections.heating &&
    selections.electrical &&
    selections.woodwork;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          <PaintBucket className="w-3.5 h-3.5" /> Etapa 3 de 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">Terminaciones</h2>
        <p className="text-muted-foreground text-sm">Pisos, cocina, paredes, aberturas y sistemas</p>
      </div>

      <StageSection
        title="Pisos y porcelanatos"
        subtitle="Material de piso para toda la vivienda"
        options={flooringOpts}
        selected={selections.flooring}
        onSelect={(v) => update("flooring", v)}
        getCostLabel={(opt) => `${formatCurrency(opt.costPerM2)}/m² (+${formatCurrency(opt.costPerM2 * area)})`}
      />

      <StageSection
        title="Revestimientos en baños"
        subtitle="Material de revestimiento de paredes de baños"
        options={bathCladdingOpts}
        selected={selections.bathroomCladding}
        onSelect={(v) => update("bathroomCladding", v)}
        getCostLabel={(opt) => `${formatCurrency(opt.costPerM2)}/m²`}
      />

      <StageSection
        title="Mesada de cocina"
        subtitle="Material de la mesada"
        options={countertopOpts}
        selected={selections.countertop}
        onSelect={(v) => update("countertop", v)}
        getCostLabel={(opt) => `+${formatCurrency(opt.costAdd)}`}
      />

      <StageSection
        title="Muebles de cocina"
        subtitle="Tipo de muebles y alacenas"
        options={cabinetsOpts}
        selected={selections.cabinets}
        onSelect={(v) => update("cabinets", v)}
        getCostLabel={(opt) => `+${formatCurrency(opt.costAdd)}`}
      />

      {/* Revestimientos de pared con m² configurables */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-base">Revestimientos de pared</h3>
          <p className="text-sm text-muted-foreground">Tratamiento de paredes interiores (puedes ajustar los m² a revestir)</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wallCladdingOpts.map((opt) => {
            const isSelected = selections.wallCladding === opt.key;
            const m2Used = (isSelected && opt.allowCustomM2) ? wallM2 : area * 0.4;
            return (
              <motion.button
                key={opt.key}
                onClick={() => update("wallCladding", opt.key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                <div className="text-xs font-bold text-primary mt-1">
                  {formatCurrency(opt.costPerM2)}/m² (+{formatCurrency(opt.costPerM2 * m2Used)})
                </div>
              </motion.button>
            );
          })}
        </div>
        {selectedWall?.allowCustomM2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 bg-secondary/40 rounded-xl p-4"
          >
            <span className="text-sm text-muted-foreground">M² a revestir con <strong>{selectedWall.label}</strong>:</span>
            <Input
              type="number"
              min={1}
              max={500}
              value={wallM2}
              onChange={(e) => update("wallCladdingM2", Math.max(1, Number(e.target.value)))}
              className="w-24 text-center font-bold"
            />
            <span className="text-sm text-muted-foreground">m²</span>
            <span className="text-sm font-bold text-primary ml-auto">
              Total: {formatCurrency(selectedWall.costPerM2 * wallM2)}
            </span>
          </motion.div>
        )}
      </div>

      <StageSection
        title="Carpintería metálica y vidrios"
        subtitle="Tipo de ventanas y puertas exteriores"
        options={windowOpts}
        selected={selections.windows}
        onSelect={(v) => update("windows", v)}
        getCostLabel={(opt) => `${formatCurrency(opt.costPerM2)}/m² abertura (+${formatCurrency(opt.costPerM2 * area * 0.15)})`}
      />

      <StageSection
        title="Calefacción"
        subtitle="Sistema de calefacción para toda la vivienda"
        options={heatingOpts}
        selected={selections.heating}
        onSelect={(v) => update("heating", v)}
        getCostLabel={(opt) => opt.costAdd > 0 ? `+${formatCurrency(opt.costAdd)}` : "Sin adicional"}
      />

      <StageSection
        title="Carpintería de madera"
        subtitle="Placares y vestidores interiores"
        options={woodworkOpts}
        selected={selections.woodwork}
        onSelect={(v) => update("woodwork", v)}
        getCostLabel={(opt) => opt.costAdd > 0 ? `+${formatCurrency(opt.costAdd)}` : "Sin adicional"}
      />

      <StageSection
        title="Instalaciones eléctricas"
        subtitle="Nivel de instalación eléctrica del proyecto"
        options={electricalOpts}
        selected={selections.electrical}
        onSelect={(v) => update("electrical", v)}
        getCostLabel={(opt) => `+${formatCurrency(opt.costAdd)}`}
      />

      <div className="flex justify-between pb-20 lg:pb-0">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2 px-8"
          disabled={!isComplete}
        >
          Siguiente <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}