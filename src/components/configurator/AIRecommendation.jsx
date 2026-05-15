import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: "Sos un asesor experto de TOBYCO Constructora, empresa argentina especializada en casas llave en mano. Respondé en Markdown, de forma concisa y profesional.",
            },
            {
              role: "user",
              content: `El usuario configuró una vivienda con estas características:
- Superficie: ${area} m²
- Sistema constructivo: ${systemLabel}
- Presupuesto estimado: ${formatCurrency(total)}

Generá exactamente 4 tips concretos y útiles en formato Markdown:

### 💡 Tips para tu proyecto

**1. [título corto]**
[tip en 1-2 oraciones sobre el sistema elegido]

**2. [título corto]**
[consejo sobre presupuesto y etapas]

**3. [título corto]**
[mencionar TOBYCO Constructora y www.tobycoconstructora.com.ar]

**4. [título corto]**
[tip práctico: prever 10% extra, visitar terreno con arquitecto, etc.]

Máximo 220 palabras.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "No se pudo generar la recomendación.";
      setRecommendation(text);
    } catch {
      setRecommendation("Ocurrió un error. Por favor contactanos por WhatsApp: +54 9 11 4041-9044");
    } finally {
      setLoading(false);
    }
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
