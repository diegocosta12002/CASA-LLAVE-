import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Star, Check } from "lucide-react";
import { EXTRAS } from "@/lib/constructionStages";
import { formatCurrency } from "@/lib/pricingData";
import { useDbConfigs, mergeWithDb } from "@/hooks/useDbConfigs";

export default function ExtrasStep({ selections, onChange, onNext, onBack }) {
  const selectedExtras = selections.extras || [];
  const { dbConfigs } = useDbConfigs();

  const extrasOpts = mergeWithDb(EXTRAS, "extra_", "costAdd", dbConfigs);

  const toggleExtra = (key) => {
    if (selectedExtras.includes(key)) {
      onChange({ ...selections, extras: selectedExtras.filter(k => k !== key) });
    } else {
      onChange({ ...selections, extras: [...selectedExtras, key] });
    }
  };

  const extrasTotal = selectedExtras.reduce((sum, key) => {
    const ex = extrasOpts.find(e => e.key === key);
    return sum + (ex?.costAdd || 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          <Star className="w-3.5 h-3.5" /> Etapa 4 de 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">Extras y adicionales</h2>
        <p className="text-muted-foreground text-sm">Selecciona los adicionales que desees incorporar (opcional)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {extrasOpts.map((extra) => {
          const isSelected = selectedExtras.includes(extra.key);
          return (
            <motion.button
              key={extra.key}
              onClick={() => toggleExtra(extra.key)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{extra.label}</div>
                  <p className="text-xs text-muted-foreground mt-1">{extra.description}</p>
                  <div className="mt-2 text-sm font-bold text-primary">+{formatCurrency(extra.costAdd)}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                  isSelected ? "bg-primary border-primary" : "border-border"
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {extrasTotal > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
          <span className="font-medium">Extras seleccionados</span>
          <span className="text-lg font-bold text-primary">+{formatCurrency(extrasTotal)}</span>
        </div>
      )}

      <div className="flex justify-between pb-20 lg:pb-0">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button onClick={onNext} size="lg" className="gap-2 px-8">
          Ver Resumen <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}