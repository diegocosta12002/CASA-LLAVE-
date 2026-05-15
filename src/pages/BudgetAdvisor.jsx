import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Sparkles, DollarSign, Home as HomeIcon,
  TrendingDown, Lightbulb, ChevronRight, AlertCircle,
  CheckCircle2, RefreshCw, Zap, Layers, Building2, Hammer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { formatCurrency, CONSTRUCTION_SYSTEMS } from "@/lib/pricingData";
import WhatsAppButton from "@/components/WhatsAppButton";
import TobyAssistant from "@/components/TobyAssistant";
import BudgetResultCard from "@/components/budget/BudgetResultCard";
import SavingsTipCard from "@/components/budget/SavingsTipCard";

const SYSTEM_ICONS = {
  traditional: Hammer,
  steel_frame: Layers,
  obra_gris: Building2,
  mixed: Zap,
};

const OG_DEFAULTS = {
  obra_gris_traditional: 890,
  obra_gris_steel: 870,
  obra_gris_mixed: 950,
};

// ── Función para llamar a Groq ────────────────────────────────────────────────
async function invokeGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Sos un asesor de TOBYCO Constructora. Respondé SIEMPRE en JSON válido, sin texto adicional.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(text);
}

export default function BudgetAdvisor() {
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { data: allConfigs = [] } = useQuery({
    queryKey: ["all_buildconfigs_advisor"],
    queryFn: () => base44.entities.BuildConfig.list("-created_date", 500),
    staleTime: 60_000,
  });

  const getConfigValue = (key, fallback) => {
    const rec = allConfigs.find(c => c.config_key === key);
    return rec ? rec.value : fallback;
  };

  const costTraditional = getConfigValue("comparator_system_traditional", 1200);
  const costSteelFrame  = getConfigValue("comparator_system_steel_frame", 1190);
  const costMixed       = getConfigValue("comparator_system_mixed", 1350);
  const costOGTraditional = getConfigValue("obra_gris_system_obra_gris_traditional", OG_DEFAULTS.obra_gris_traditional);
  const costOGSteel       = getConfigValue("obra_gris_system_obra_gris_steel",       OG_DEFAULTS.obra_gris_steel);
  const costOGMixed       = getConfigValue("obra_gris_system_obra_gris_mixed",       OG_DEFAULTS.obra_gris_mixed);

  const handleAnalyze = async () => {
    const numBudget = parseFloat(budget.replace(/[.,]/g, "").replace(",", "."));
    if (!numBudget || numBudget < 1000) {
      setError("Por favor ingresá un presupuesto válido mayor a u$s 1.000");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const budgetUSD = currency === "ARS" ? numBudget / 1000 : numBudget;

      const STANDARD_SIZES = [80, 120, 180];
      const cheapestSystemCost = Math.min(costTraditional, costSteelFrame, costMixed);
      const buildableM2 = budgetUSD / cheapestSystemCost;
      const targetM2 = STANDARD_SIZES.find(s => s >= buildableM2) ?? 180;

      const computeAlternatives = (m2) => [
        { label: `Casa ${m2}m² — Obra Gris Tradicional`, mode: "obra_gris", cost_per_m2: costOGTraditional, total_cost: m2 * costOGTraditional, gap: Math.max(0, m2 * costOGTraditional - budgetUSD) },
        { label: `Casa ${m2}m² — Tradicional Llave en mano`, mode: "llave_en_mano", cost_per_m2: costTraditional, total_cost: m2 * costTraditional, gap: Math.max(0, m2 * costTraditional - budgetUSD) },
        { label: `Casa ${m2}m² — Steel Framing Llave en mano`, mode: "llave_en_mano", cost_per_m2: costSteelFrame, total_cost: m2 * costSteelFrame, gap: Math.max(0, m2 * costSteelFrame - budgetUSD) },
      ].sort((a, b) => a.gap - b.gap);

      const computedAlternatives = { targetM2, alts: computeAlternatives(targetM2) };

      const prompt = `Sos el asesor virtual de TOBYCO Constructora, empresa argentina líder en casas llave en mano.

El cliente tiene un presupuesto de u$s ${budgetUSD.toLocaleString("es-AR")}.

Costos llave en mano: Tradicional u$s ${costTraditional}/m² | Steel Framing u$s ${costSteelFrame}/m² | Mixto u$s ${costMixed}/m²
Costos Obra Gris: Tradicional u$s ${costOGTraditional}/m² | Steel Framing u$s ${costOGSteel}/m² | Mixto u$s ${costOGMixed}/m²

Respondé en JSON con este esquema exacto:
{
  "recommended_system": "traditional|steel_frame|mixed",
  "recommendation_reason": "string",
  "systems_analysis": [
    { "system_key": "traditional|steel_frame|mixed", "system_name": "string", "buildable_m2": number, "total_cost": number, "feasibility": "ideal|possible|limited|not_recommended", "note": "string" }
  ],
  "savings_tips": [
    { "title": "string", "description": "string", "potential_saving_pct": number }
  ],
  "phase_strategy": "string",
  "summary": "string"
}`;

      const response = await invokeGroq(prompt);
      setResult({ ...response, budgetUSD, computedAlternatives });
    } catch (err) {
      setError("Hubo un problema al analizar tu presupuesto. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const budgetUSD = result?.budgetUSD ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg"
              alt="TOBYCO"
              className="h-8 object-contain"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <Link to="/configurator">
            <Button size="sm" className="gap-2 text-xs">
              Configurador <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" /> Asesor Inteligente de Presupuesto
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-4">
            ¿Cuánto tenés<br />
            <span className="text-primary">para construir?</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Ingresá tu presupuesto disponible y te decimos exactamente qué podés construir,
            qué sistema te conviene y cómo maximizar cada peso.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card border rounded-2xl p-8 mb-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-lg">Mi presupuesto disponible</div>
              <div className="text-sm text-muted-foreground">Ingresá el monto total que tenés para construir</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex rounded-lg border overflow-hidden flex-shrink-0">
              {["USD", "ARS"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    currency === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {c === "USD" ? "u$s" : "ARS"}
                </button>
              ))}
            </div>

            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder={currency === "USD" ? "Ej: 80000" : "Ej: 80.000.000"}
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9.,]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="h-12 text-lg pl-4 pr-16 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                {currency === "USD" ? "USD" : "ARS"}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {(currency === "USD" ? [50000, 80000, 120000, 160000, 200000] : [50000000, 80000000, 120000000, 160000000]).map((amt) => (
              <button
                key={amt}
                onClick={() => setBudget(amt.toLocaleString("es-AR"))}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-medium text-secondary-foreground transition-colors"
              >
                {currency === "USD" ? `u$s ${(amt / 1000).toFixed(0)}k` : `$${(amt / 1000000).toFixed(0)}M`}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full gap-2 text-base h-12"
            onClick={handleAnalyze}
            disabled={loading || !budget}
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analizando tu presupuesto...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analizar mi presupuesto</>
            )}
          </Button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1 opacity-80">Análisis de tu presupuesto · {formatCurrency(budgetUSD)}</div>
                    <p className="text-primary-foreground/95 leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-accent">Sistema recomendado para vos</span>
                </div>
                <div className="flex items-start gap-4">
                  {(() => {
                    const Icon = SYSTEM_ICONS[result.recommended_system] ?? HomeIcon;
                    const sys = CONSTRUCTION_SYSTEMS[result.recommended_system];
                    const analysis = result.systems_analysis?.find(s => s.system_key === result.recommended_system);
                    return (
                      <>
                        <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-7 h-7 text-accent" />
                        </div>
                        <div>
                          <div className="font-bold text-xl">{sys?.label ?? result.recommended_system}</div>
                          <div className="text-sm text-muted-foreground mb-2">{sys?.subtitle}</div>
                          <div className="text-primary font-bold text-lg">
                            {analysis?.buildable_m2 ? `${Math.round(analysis.buildable_m2)} m² construibles` : ""}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{result.recommendation_reason}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-xl mb-4">Comparativa por sistema — Llave en mano</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.systems_analysis?.filter(s => s.system_key !== "obra_gris").map((sys, i) => (
                    <BudgetResultCard
                      key={sys.system_key}
                      sys={sys}
                      isRecommended={sys.system_key === result.recommended_system}
                      Icon={SYSTEM_ICONS[sys.system_key] ?? HomeIcon}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <h2 className="font-display font-bold text-lg text-amber-800">Alternativa: Obra Gris</h2>
                  <span className="text-xs bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full font-medium">Construcción por etapas</span>
                </div>
                <p className="text-sm text-amber-800 mb-2">La Obra Gris no es un sistema constructivo, sino una modalidad sin terminaciones. Ideal si querés empezar antes o tenés presupuesto ajustado.</p>
                <p className="text-sm font-semibold text-amber-700">Consultá por valores de obra gris en sus diferentes sistemas.</p>
              </div>

              {result.savings_tips?.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    Cómo maximizar tu presupuesto
                  </h2>
                  <div className="space-y-3">
                    {result.savings_tips.map((tip, i) => (
                      <SavingsTipCard key={i} tip={tip} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {result.phase_strategy && (
                <div className="bg-secondary/40 rounded-2xl p-6 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Estrategia por etapas</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.phase_strategy}</p>
                </div>
              )}

              {result.computedAlternatives && (
                <div>
                  <h2 className="font-display font-bold text-xl mb-1">Valores estimados por tamaño</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Alternativas más próximas a tu presupuesto para una casa de <strong>{result.computedAlternatives.targetM2} m²</strong>.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {(result.computedAlternatives.alts ?? []).map((alt, i) => {
                      const isOG = alt.mode === "obra_gris";
                      return (
                        <div key={i} className={`rounded-xl border p-4 ${isOG ? "bg-amber-50 border-amber-200" : "bg-card border-border"}`}>
                          <div className={`text-[11px] font-semibold mb-2 leading-tight ${isOG ? "text-amber-700" : "text-foreground"}`}>
                            {alt.label}
                          </div>
                          <div className={`font-bold text-lg ${isOG ? "text-amber-700" : "text-primary"}`}>
                            {formatCurrency(alt.total_cost)}
                          </div>
                          {alt.gap > 0 ? (
                            <div className={`text-xs mt-1 font-medium ${isOG ? "text-amber-600" : "text-primary/70"}`}>
                              + {formatCurrency(alt.gap)} adicional
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> ¡Tu presupuesto alcanza!
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-1">{formatCurrency(alt.cost_per_m2)}/m²</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-primary rounded-2xl p-8 text-primary-foreground text-center">
                <h3 className="font-display font-bold text-2xl mb-2">¿Listo para dar el paso?</h3>
                <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto text-sm">
                  Usá el configurador para personalizar cada detalle y recibir tu presupuesto oficial.
                </p>
                <Link to="/configurator">
                  <Button size="lg" variant="secondary" className="gap-2 px-8">
                    Ir al configurador <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WhatsAppButton />
      <TobyAssistant />
    </div>
  );
}
