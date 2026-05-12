import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PREDEFINED_SIZES } from "@/lib/pricingData";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Ruler, Home, ArrowRight, Loader2, ImageIcon, Check, Layers, Building2 } from "lucide-react";
import FloorPlan from "./FloorPlan";
import { formatCurrency } from "@/lib/pricingData";

const BATHROOM_SUGGESTIONS = {
  80:  "1 Baño",
  120: "1 Baño + 1 Toilette",
  180: "2 Baños o 2 Baños + Toilette",
};

const FLOOR_OPTIONS = [
  { key: "single", label: "1 Planta", sublabel: "Planta baja", description: "Toda la vivienda en un solo nivel", icon: Home, costLabel: "Sin adicional" },
  { key: "double", label: "2 Plantas", sublabel: "PB + 1° Piso", description: "Vivienda de dos plantas", icon: Building2, costLabel: "+8% del costo base" },
];

export default function SizeStep({ area, onAreaChange, floors, onFloorsChange, onNext }) {
  // Derive customMode from the current area prop
  const [customMode, setCustomMode] = useState(false);
  const [houseImage, setHouseImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [lastGeneratedArea, setLastGeneratedArea] = useState(null);

  // Sync customMode whenever area changes externally (e.g. back navigation)
  useEffect(() => {
    const isPreset = PREDEFINED_SIZES.some(s => s.m2 === area);
    if (isPreset) setCustomMode(false);
  }, [area]);

  const selectPreset = (m2) => {
    setCustomMode(false);
    setHouseImage(null);
    setLastGeneratedArea(null);
    onAreaChange(m2);
  };

  const handleCustomMode = () => {
    setCustomMode(true);
  };

  const generateHouseImage = async (m2) => {
    if (generatingImage) return;
    setGeneratingImage(true);
    setHouseImage(null);
    try {
      const sizeLabel = m2 <= 70 ? "small" : m2 <= 120 ? "medium" : m2 <= 200 ? "large" : "very large";
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Modern minimalist house exterior, flat roof, white walls, ${sizeLabel} home, ${m2}sqm, clean lines, professional architecture photo`,
      });
      setHouseImage(result.url);
      setLastGeneratedArea(m2);
    } catch (e) {
      console.error("Image generation failed", e);
    } finally {
      setGeneratingImage(false);
    }
  };

  const bathSuggestion = Object.entries(BATHROOM_SUGGESTIONS).reduce((acc, [m, s]) => {
    if (area >= Number(m)) return s;
    return acc;
  }, "1 Baño");

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">
          ¿Cuántos m² necesitas?
        </h2>
        <p className="text-muted-foreground">
          Selecciona un modelo predefinido o ingresa tu superficie personalizada
        </p>
      </div>

      {/* Predefined models */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PREDEFINED_SIZES.map((size) => {
          const isSelected = !customMode && area === size.m2;
          return (
            <button
              key={size.m2}
              type="button"
              onClick={() => selectPreset(size.m2)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all hover:-translate-y-1 active:scale-95 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{size.label}</div>
                  <div className="text-2xl font-bold text-primary">{size.m2} m²</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{size.description}</p>
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom size */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleCustomMode}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            customMode
              ? "border-primary bg-primary/5"
              : "border-dashed border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-primary" />
            <span className="font-medium">Tamaño personalizado</span>
          </div>
        </button>

        <AnimatePresence>
          {customMode && (
            <motion.div
              key="custom-controls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 px-2 pt-2">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={40}
                    max={800}
                    value={area}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onAreaChange(Math.max(40, Math.min(800, val)));
                    }}
                    className="w-32 text-center text-xl font-bold"
                  />
                  <span className="text-lg text-muted-foreground">m²</span>
                </div>
                <Slider
                  value={[area]}
                  onValueChange={([v]) => onAreaChange(v)}
                  min={40}
                  max={800}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>40 m²</span>
                  <span>800 m²</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Area summary + bathroom suggestion */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-5 bg-secondary/50 rounded-xl">
          <div className="text-5xl font-bold font-display text-primary">{area}</div>
          <div className="text-sm text-muted-foreground mt-1">metros cuadrados</div>
        </div>
        <div className="text-center p-5 bg-accent/10 rounded-xl border border-accent/20">
          <div className="text-xs text-muted-foreground font-medium mb-1">Baños sugeridos</div>
          <div className="text-sm font-bold text-accent leading-snug">{bathSuggestion}</div>
          <div className="text-xs text-muted-foreground mt-1">Podrás personalizar luego</div>
        </div>
      </div>

      {/* Floor type selector */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-base">¿En cuántas plantas?</h3>
          <p className="text-sm text-muted-foreground">Planta baja sola o con primer piso</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {FLOOR_OPTIONS.map((opt) => {
            const isSelected = floors === opt.key;
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onFloorsChange(opt.key)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all hover:-translate-y-1 active:scale-95 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.sublabel}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
                <div className={`mt-2 text-xs font-semibold ${opt.key === "double" ? "text-primary" : "text-accent"}`}>
                  {opt.costLabel}
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor Plan — updates reactively with area */}
      <FloorPlan area={area} stageSelections={{}} />

      {/* AI House Image */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b">
          <div>
            <div className="font-medium text-sm">Imagen ilustrativa</div>
            <div className="text-xs text-muted-foreground">Genera una vista de ejemplo de tu casa</div>
          </div>
          <Button
            onClick={() => generateHouseImage(area)}
            disabled={generatingImage}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            {generatingImage ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
            ) : (
              <><ImageIcon className="w-4 h-4" /> Ver ejemplo</>
            )}
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {houseImage ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <img src={houseImage} alt={`Casa ${area}m²`} className="w-full aspect-video object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-xs py-2">
                ⚠️ Imagen ilustrativa generada por IA — Solo a modo de ejemplo para una casa de {lastGeneratedArea} m²
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="aspect-video flex items-center justify-center bg-secondary/30 text-muted-foreground"
            >
              <div className="text-center space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
                <div className="text-sm">Haz clic en "Ver ejemplo" para generar una imagen ilustrativa</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end pb-20 lg:pb-0">
        <Button onClick={onNext} size="lg" className="gap-2 px-8">
          Siguiente <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}