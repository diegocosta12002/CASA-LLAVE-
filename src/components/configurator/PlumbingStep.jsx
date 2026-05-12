import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Droplets } from "lucide-react";
import { PLUMBING_TYPES, SANITARY_TYPES, BATHROOM_CONFIG } from "@/lib/constructionStages";
import { formatCurrency } from "@/lib/pricingData";
import { useDbConfigs, mergeWithDb } from "@/hooks/useDbConfigs";
import StageSection from "./StageSection";

export default function PlumbingStep({ selections, onChange, area, onNext, onBack }) {
  const update = (key, val) => onChange({ ...selections, [key]: val });
  const { dbConfigs } = useDbConfigs();

  const bathConfig = BATHROOM_CONFIG.find(b => b.key === selections.bathroom);
  const numBathrooms = (bathConfig?.bathrooms || 1) + (bathConfig?.toilets || 0);

  const plumbingOpts = mergeWithDb(PLUMBING_TYPES, "plumbing_", "costAdd",         dbConfigs);
  const sanitaryOpts = mergeWithDb(SANITARY_TYPES, "sanitary_", "costPerBathroom", dbConfigs);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          <Droplets className="w-3.5 h-3.5" /> Etapa 2 de 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">Instalaciones sanitarias</h2>
        <p className="text-muted-foreground text-sm">Grifería y artefactos para tus {numBathrooms} {numBathrooms === 1 ? "baño" : "baños"}</p>
      </div>

      <StageSection
        title="Grifería"
        subtitle="Calidad de la grifería en toda la vivienda"
        options={plumbingOpts}
        selected={selections.plumbing}
        onSelect={(v) => update("plumbing", v)}
        getCostLabel={(opt) => `+${formatCurrency(opt.costAdd)}`}
      />

      <StageSection
        title="Artefactos sanitarios"
        subtitle={`Inodoro, bidet, lavatorio, duchero × ${numBathrooms} ${numBathrooms === 1 ? "baño" : "baños"}`}
        options={sanitaryOpts}
        selected={selections.sanitary}
        onSelect={(v) => update("sanitary", v)}
        getCostLabel={(opt) => `${formatCurrency(opt.costPerBathroom)}/baño (+${formatCurrency(opt.costPerBathroom * numBathrooms)})`}
      />

      <div className="flex justify-between pb-20 lg:pb-0">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2 px-8"
          disabled={!selections.plumbing || !selections.sanitary}
        >
          Siguiente <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}