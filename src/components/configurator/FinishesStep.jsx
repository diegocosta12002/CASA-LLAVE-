import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FINISH_TIERS, FINISH_DETAILS, formatCurrency } from "@/lib/pricingData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";

export default function FinishesStep({
  finishMode, finishTier, finishDetails,
  onFinishModeChange, onFinishTierChange, onFinishDetailChange,
  area, onNext, onBack
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">
          Acabados y terminaciones
        </h2>
        <p className="text-muted-foreground">
          Elige nivel de acabados o personaliza cada detalle
        </p>
      </div>

      <Tabs value={finishMode} onValueChange={onFinishModeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="simple" className="text-sm font-medium">
            Modo Simple
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-sm font-medium">
            Modo Avanzado
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        {finishMode === "simple" ? (
          <SimpleFinishes
            key="simple"
            selectedTier={finishTier}
            onSelect={onFinishTierChange}
            area={area}
          />
        ) : (
          <AdvancedFinishes
            key="advanced"
            details={finishDetails}
            onDetailChange={onFinishDetailChange}
            area={area}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between">
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

function SimpleFinishes({ selectedTier, onSelect, area }) {
  const tiers = Object.values(FINISH_TIERS);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier.key;
        return (
          <motion.button
            key={tier.key}
            onClick={() => onSelect(tier.key)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-6 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="font-bold text-lg mb-1">{tier.label}</div>
            <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
            <div className="text-xs text-muted-foreground">Adicional por m²</div>
            <div className="text-lg font-bold text-primary">
              +{formatCurrency(tier.priceAdd)}/m²
            </div>
            {isSelected && (
              <motion.div
                layoutId="tier-indicator"
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function AdvancedFinishes({ details, onDetailChange, area }) {
  const categories = Object.entries(FINISH_DETAILS);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {categories.map(([catKey, cat]) => (
        <div key={catKey} className="space-y-3">
          <h3 className="font-semibold text-lg">{cat.label}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cat.options.map((opt) => {
              const isSelected = details[catKey] === opt.key;
              return (
                <motion.button
                  key={opt.key}
                  onClick={() => onDetailChange(catKey, opt.key)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    +{formatCurrency(opt.costPerM2)}/m²
                  </div>
                  <div className="text-xs text-primary font-medium mt-1">
                    +{formatCurrency(opt.costPerM2 * area)} total
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}