import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { CONSTRUCTION_SYSTEMS, FINISH_TIERS } from "@/lib/pricingData";

export default function HouseVisualization({ area, system, finishMode, finishTier, finishDetails }) {
  const [renderUrl, setRenderUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const systemLabel = CONSTRUCTION_SYSTEMS[system]?.label || "Tradicional";
  const tierLabel = finishMode === "simple"
    ? (FINISH_TIERS[finishTier]?.label || "Estándar")
    : "Personalizado";

  const getHouseType = () => {
    if (area <= 90) return "small single-story modern house";
    if (area <= 140) return "medium two-story family house";
    return "large spacious luxury house";
  };

  const getSystemStyle = () => {
    const styles = {
      traditional: "traditional brick and concrete construction, Mediterranean style",
      steel_frame: "modern steel frame construction, contemporary industrial style",
      wood_frame: "warm wooden frame construction, Scandinavian cabin style",
      modular: "sleek modular prefabricated design, minimalist cubic architecture",
    };
    return styles[system] || styles.traditional;
  };

  const getFinishStyle = () => {
    if (finishMode === "simple") {
      const styles = {
        basic: "clean simple finishes, functional aesthetic",
        standard: "mid-range quality finishes, elegant and modern",
        premium: "luxury high-end finishes, premium materials, designer details",
      };
      return styles[finishTier] || styles.standard;
    }
    return "custom detailed finishes";
  };

  const generateRender = async () => {
    setIsGenerating(true);
    const prompt = `Photorealistic architectural render of a ${getHouseType()}, approximately ${area} square meters, ${getSystemStyle()}, with ${getFinishStyle()}. Beautiful landscaping, golden hour lighting, professional architectural photography, 8k quality, exterior view showing the full house with garden and driveway.`;

    const result = await base44.integrations.Core.GenerateImage({ prompt });
    setRenderUrl(result.url);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Vista previa
        </h3>
        <Button
          onClick={generateRender}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generar render IA
            </>
          )}
        </Button>
      </div>

      <div className="relative rounded-xl overflow-hidden border bg-secondary/30 aspect-video flex items-center justify-center">
        {renderUrl ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={renderUrl}
            alt="Render de la casa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-8 space-y-4">
            {/* Simple schematic based on area */}
            <svg viewBox="0 0 400 250" className="w-full max-w-sm mx-auto">
              {/* Ground */}
              <rect x="20" y="200" width="360" height="30" rx="4" fill="hsl(120, 30%, 75%)" opacity="0.4" />

              {/* House body */}
              <motion.rect
                x={200 - Math.min(area * 0.8, 160)}
                y={200 - Math.min(area * 0.5, 100)}
                width={Math.min(area * 1.6, 320)}
                height={Math.min(area * 0.5, 100)}
                rx="4"
                fill="hsl(var(--primary))"
                opacity="0.15"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ originY: 1 }}
              />

              {/* Roof */}
              <motion.polygon
                points={`${200 - Math.min(area * 0.85, 170)},${200 - Math.min(area * 0.5, 100)} 200,${200 - Math.min(area * 0.5, 100) - 50} ${200 + Math.min(area * 0.85, 170)},${200 - Math.min(area * 0.5, 100)}`}
                fill="hsl(var(--primary))"
                opacity="0.25"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                transition={{ delay: 0.3 }}
              />

              {/* Windows */}
              {Array.from({ length: Math.min(Math.floor(area / 40), 4) }).map((_, i) => {
                const houseW = Math.min(area * 1.6, 320);
                const startX = 200 - houseW / 2;
                const spacing = houseW / (Math.min(Math.floor(area / 40), 4) + 1);
                return (
                  <motion.rect
                    key={i}
                    x={startX + spacing * (i + 1) - 12}
                    y={200 - Math.min(area * 0.5, 100) + 20}
                    width="24"
                    height="30"
                    rx="2"
                    fill="hsl(200, 60%, 70%)"
                    opacity="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  />
                );
              })}

              {/* Door */}
              <motion.rect
                x="188"
                y={200 - 45}
                width="24"
                height="45"
                rx="2"
                fill="hsl(var(--primary))"
                opacity="0.4"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ originY: 1 }}
                transition={{ delay: 0.4 }}
              />

              {/* Area label */}
              <text x="200" y="230" textAnchor="middle" className="fill-muted-foreground text-xs" fontSize="12">
                {area} m²
              </text>
            </svg>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {systemLabel} · {tierLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Haz clic en "Generar render IA" para una vista realista
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}