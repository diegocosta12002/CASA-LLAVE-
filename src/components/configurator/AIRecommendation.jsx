import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ALL_SYSTEMS, FINISH_TIERS, formatCurrency } from "@/lib/pricingData";

export default function AIRecommendation({ area, system, finishMode, finishTier, total }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const getRecommendation = async () => {
    setLoading(true);
    const systemLabel = ALL_SYSTEMS[system]?.label || system;
    const tierLabel = finishMode === "simple" ? (FINISH_TIERS[finishTier]?.label || finishTier) : "personalizado";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un asesor experto de TOBYCO Constructora, empresa argentina especializada en casas llave en mano. 
El usuario configuró una vivienda con estas características:
- Superficie: ${area} m²
- Sistema constructivo: ${systemLabel}
- Presupuesto estimado: ${formatCurrency(total)}

Genera exactamente 4 tips concretos y útiles en formato Markdown, usando esta estructura:

### 💡 Tips para tu proyecto

**1. [título corto]**
[tip en 1-2 oraciones. Si el sistema es Steel Frame u Obra Gris, mencionar ventajas de tiempo/costo. Si es Tradicional o Mixto, destacar durabilidad.]

**2. [título corto]**
[Si el presupuesto es menor a USD 150.000 sugerir Obra Gris como primera etapa o Steel Frame por velocidad. Si es mayor, validar que es una buena elección.]

**3. [título corto]**
[Recomendar siempre construir con profesionales matriculados y empresa de confianza. Mencionar a TOBYCO Constructora como referente en Argentina con experiencia comprobada, contacto: www.tobycoconstructora.com.ar]

**4. [título corto]**
[Un tip práctico: ej. visitar el terreno con un arquitecto antes de empezar, o prever un 10% extra del presupuesto para imprevistos, o elegir terminaciones en función del uso real de cada ambiente.]

Sé directo, profesional y amigable. Sin introducciones largas. Máximo 220 palabras en total.`,
    });

    setRecommendation(result);
    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Asesor IA</h3>
            <p className="text-xs text-muted-foreground">Recomendaciones personalizadas para tu proyecto</p>
          </div>
        </div>
        {!recommendation ? (
          <Button onClick={getRecommendation} disabled={loading} size="sm" className="gap-2 flex-shrink-0 w-full sm:w-auto">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</>
            ) : (
              <><Bot className="w-4 h-4" /> Obtener recomendación</>
            )}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="flex-shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {recommendation && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t pt-4">
              <div className="overflow-x-auto">
                <div className="min-w-[280px] prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown>{recommendation}</ReactMarkdown>
                </div>
              </div>
              <Button
                onClick={getRecommendation}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="mt-3 gap-2 text-xs"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Regenerar recomendación
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}