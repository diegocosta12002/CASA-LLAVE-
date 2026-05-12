import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { LOCATION_TYPES, FOUNDATION_TYPES, BATHROOM_CONFIG, ROOFING_TYPES } from "@/lib/constructionStages";
import { formatCurrency } from "@/lib/pricingData";
import { useDbConfigs, mergeWithDb } from "@/hooks/useDbConfigs";
import StageSection from "./StageSection";

export default function LocationFoundationStep({ selections, onChange, area, isObraGris, onNext, onBack }) {
  const update = (key, val) => onChange({ ...selections, [key]: val });
  const { dbConfigs } = useDbConfigs();

  const locationOpts  = mergeWithDb(LOCATION_TYPES,   "location_",  "costAdd",   dbConfigs);
  const foundationOpts = mergeWithDb(FOUNDATION_TYPES, "foundation_","costPerM2", dbConfigs);
  const roofingOpts   = mergeWithDb(ROOFING_TYPES,    "roofing_",   "costPerM2", dbConfigs);
  const bathroomOpts  = mergeWithDb(BATHROOM_CONFIG,  "bathroom_",  "costAdd",   dbConfigs);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          <MapPin className="w-3.5 h-3.5" /> Etapa 1 de 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">Ubicación y fundaciones</h2>
        <p className="text-muted-foreground text-sm">Define dónde y cómo se construirá la base de tu casa</p>
      </div>

      <StageSection
        title="Lugar de construcción"
        subtitle="¿En qué tipo de urbanización se construye?"
        options={locationOpts}
        selected={selections.location}
        onSelect={(v) => update("location", v)}
        getCostLabel={(opt) => opt.costAdd > 0 ? `+${formatCurrency(opt.costAdd)}` : "Sin adicional"}
      />

      <StageSection
        title="Tipo de fundación"
        subtitle="La base estructural de tu vivienda"
        options={foundationOpts}
        selected={selections.foundation}
        onSelect={(v) => update("foundation", v)}
        getCostLabel={(opt) => `${formatCurrency(opt.costPerM2)}/m² (+${formatCurrency(opt.costPerM2 * area)})`}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 flex items-start gap-2">
        <span className="text-lg leading-none mt-0.5">ℹ️</span>
        <span>El tipo de fundación va a depender del estudio de suelo realizado en el lugar.</span>
      </div>

      <StageSection
        title="Tipo de cubierta / techo"
        subtitle="El sistema de techado de la vivienda"
        options={roofingOpts}
        selected={selections.roofing}
        onSelect={(v) => update("roofing", v)}
        getCostLabel={(opt) => `${formatCurrency(opt.costPerM2)}/m² (+${formatCurrency(opt.costPerM2 * area)})`}
      />

      {!isObraGris && (
        <StageSection
          title="Baños y toilettes"
          subtitle="Cantidad de baños según el modelo elegido"
          options={bathroomOpts}
          selected={selections.bathroom}
          onSelect={(v) => update("bathroom", v)}
          getCostLabel={(opt) => opt.costAdd > 0 ? `+${formatCurrency(opt.costAdd)}` : "Incluido en base"}
        />
      )}

      {isObraGris && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Nota Obra Gris:</strong> Este sistema incluye únicamente fundación, estructura, revoques (grueso/fino), cañerías sin grifería y cubierta. Los pasos de terminaciones, artefactos y sanitarios no aplican.
        </div>
      )}

      <div className="flex justify-between pb-20 lg:pb-0">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2 px-8"
          disabled={
            !selections.location ||
            !selections.foundation ||
            !selections.roofing ||
            (!isObraGris && !selections.bathroom)
          }
        >
          Siguiente <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}