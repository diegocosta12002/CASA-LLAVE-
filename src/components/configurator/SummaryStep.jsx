import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { calculateTotal, formatCurrency, ALL_SYSTEMS, getEstimatedMonths } from "@/lib/pricingData";
import { FLOOR_TYPES } from "@/lib/constructionStages";
import {
  calculateStagesCost, LOCATION_TYPES, FOUNDATION_TYPES, ROOFING_TYPES,
  BATHROOM_CONFIG, PLUMBING_TYPES, SANITARY_TYPES, FLOORING_TYPES,
  KITCHEN_COUNTERTOP, KITCHEN_CABINETS, WALL_CLADDING, WINDOW_TYPES, EXTRAS,
  BATHROOM_CLADDING, HEATING_TYPES, ELECTRICAL_TYPES, WOODWORK_TYPES
} from "@/lib/constructionStages";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Send, Loader2, Printer, FileText, X, Lock, LogIn, Crown } from "lucide-react";
import BudgetBreakdownCard from "@/components/configurator/BudgetBreakdownCard";
import { generateProfessionalPDF } from "@/lib/generatePDF";
import GanttChart from "./GanttChart";
import AIRecommendation from "./AIRecommendation";
import PrintStyles from "./PrintStyles";
import PremiumPDFGate from "./PremiumPDFGate";

const LOGO_URL = "https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg";

const PAYMENT_STAGES = [
  { label: "Etapa 1 — Fundaciones", pct: 0.12 },
  { label: "Etapa 2 — Estructura", pct: 0.18 },
  { label: "Etapa 3 — Cerramientos", pct: 0.15 },
  { label: "Etapa 4 — Instalaciones", pct: 0.20 },
  { label: "Etapa 5 — Terminaciones", pct: 0.25 },
  { label: "Etapa 6 — Exteriores y entrega", pct: 0.10 },
];

export default function SummaryStep({ area, system, finishMode, finishTier, finishDetails, stageSelections, floors, onBack }) {
  const { toast } = useToast();
  const { isAuthenticated, navigateToLogin, user } = useAuth();

  // Check if user just returned from Stripe payment success
  const urlParams = new URLSearchParams(window.location.search);
  const justUnlocked = urlParams.get("pdf_unlocked") === "1";
const [localUnlocked, setLocalUnlocked] = useState(false);
  // PDF is unlocked if user has paid (stored on user entity) OR just returned from payment
const pdfUnlocked = user?.pdf_unlocked === true || justUnlocked || localUnlocked;
  const { data: termsData = [] } = useQuery({
    queryKey: ["terms_config"],
    queryFn: async () => { const { data } = await supabase.from("terms_config").select("*").order("order"); return data || []; },
    staleTime: 60_000,
  });
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfBanner, setPdfBanner] = useState(false);
  const autoSavedRef = useRef(false);

  // Auto-save budget as lead when user reaches summary
  useEffect(() => {
    if (!isAuthenticated || !user || autoSavedRef.current) return;
    autoSavedRef.current = true;

    const config = {
      area,
      system_key: system,
      system: systemInfo?.label,
      floors,
      ...(stageSelections || {}),
    };

    await supabase.from("leads").insert({
      name: user.full_name || "",
      email: user.email || "",
      configuration: config,
      total_price: grandTotal,
      status: "new",
      source: "configurador",
    });
  // eslint-disable-next-line

  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
   queryFn: async () => { const { data } = await supabase.from("build_config").select("*"); return data || []; },
    staleTime: 60_000,
  });
  const baseResult = calculateTotal(area, system, finishMode, finishTier, finishDetails, dbConfigs, floors);
  const bathConfig = BATHROOM_CONFIG.find(b => b.key === stageSelections?.bathroom);
  const stagesResult = calculateStagesCost(stageSelections || {}, area, system, bathConfig, dbConfigs);
  const grandTotal = baseResult.total + stagesResult.total;
  const systemInfo = ALL_SYSTEMS[system];
  const estimatedMonths = getEstimatedMonths(system, area);
  const isObraGris = system?.startsWith("obra_gris");
  const today = new Date().toLocaleDateString("es-AR");
  const perM2 = grandTotal > 0 && area > 0 ? Math.round(grandTotal / area) : 0;

  const getLabel = (list, key) => list?.find(x => x.key === key)?.label || key || "-";

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Debes registrarte o iniciar sesión para descargar o enviar el presupuesto.",
        variant: "destructive",
      });
      navigateToLogin();
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!requireAuth()) return;
    setSaving(true);
          await supabase.from("saved_projects").insert({
      project_name: `Casa ${area}m² - ${systemInfo?.label}`,
      area_m2: area,
      construction_system: system,
      finish_mode: finishMode,
      finish_tier: finishMode === "simple" ? finishTier : null,
      finish_details: stageSelections || {},
      total_price: grandTotal,
      breakdown: { ...baseResult.breakdown, stages: stagesResult.total },
    });
    setSavedBanner(true);
  };

  const handleSubmitLead = async () => {
    if (!requireAuth()) return;
    if (!contactForm.name || !contactForm.email) {
      toast({ title: "Campos requeridos", description: "Por favor completa nombre y email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await supabase.from("leads").insert({
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
        configuration: { area, system: systemInfo?.label, finishTier, ...stageSelections },
        total_price: grandTotal,
        status: "new",
      });
      console.log("Enviando mail al worker...");
      await fetch("https://jolly-sunset-7756tobyco-email.diegocosta12002.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: contactForm.name,
          clientEmail: contactForm.email,
          clientPhone: contactForm.phone,
          area,
          systemLabel: systemInfo?.label,
          grandTotal,
          perM2,
          estimatedMonths,
        }),
      }).catch(err => console.error("Email error:", err));
    setSubmitting(false);
    setShowContactForm(false);
    toast({ title: "Consulta enviada", description: "Nos pondremos en contacto contigo pronto." });
  };

  const handleExportPDF = async () => {
    if (!requireAuth()) return;
    // Si faltan datos obligatorios, abrir el formulario y no continuar
    if (!contactForm.name || !contactForm.email) {
      setShowContactForm(true);
      toast({ title: "Datos requeridos", description: "Por favor completá tu nombre y email antes de descargar el PDF.", variant: "destructive" });
      return;
    }
    setGeneratingPDF(true);
    try {
      const clientData = { name: contactForm.name, email: contactForm.email, phone: contactForm.phone };
      await generateProfessionalPDF({ area, system, stageSelections, baseResult, stagesResult, grandTotal, clientData, termsData, dbConfigs, floors });
      setPdfBanner(true);
      // Enviar email a la empresa con los detalles del presupuesto
      await fetch("https://jolly-sunset-7756tobyco-email.diegocosta12002.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: contactForm.name,
        clientEmail: contactForm.email,
        clientPhone: contactForm.phone,
        area,
        systemLabel: systemInfo?.label,
        grandTotal,
        perM2,
        estimatedMonths,
        floors,
        breakdown: { ...baseResult.breakdown, stages: stagesResult.total },
        stageSelections,
      }),
    }).catch(err => console.error("Budget email error:", err));
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    if (!requireAuth()) return;
    // Si faltan datos obligatorios, abrir el formulario y no continuar
    if (!contactForm.name || !contactForm.email) {
      setShowContactForm(true);
      toast({ title: "Datos requeridos", description: "Por favor completá tu nombre y email antes de imprimir.", variant: "destructive" });
      return;
    }
    setGeneratingPDF(true);
    try {
      const clientData = { name: contactForm.name, email: contactForm.email, phone: contactForm.phone };
      await generateProfessionalPDF({ area, system, stageSelections, baseResult, stagesResult, grandTotal, clientData, termsData, dbConfigs, floors, openForPrint: true });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleShowContact = () => {
    if (!requireAuth()) return;
    setShowContactForm(true);
  };

  return (
    <>
      {/* ── Print-only area ── */}
      <PrintStyles />
      <div id="print-summary">
        <div className="print-header">
          <img src={LOGO_URL} alt="TOBYCO" className="print-logo" onError={(e) => { e.target.style.display = "none"; }} />
          <div className="print-header-right">
            <div>www.tobycoconstructora.com.ar</div>
            <div>info@tobyco.com.ar</div>
          </div>
        </div>
        <div className="print-title">
          <h1>PRESUPUESTO</h1>
          <p>{isObraGris ? "Obra Gris" : "Casa Llave en Mano"} — TOBYCO Constructora</p>
          <div className="print-title-line" />
        </div>
        <div className="print-metrics">
          <div className="print-metric-card"><div className="print-metric-label">Superficie</div><div className="print-metric-value">{area} m²</div></div>
          <div className="print-metric-card"><div className="print-metric-label">Sistema</div><div className="print-metric-value">{systemInfo?.label || "—"}</div></div>
          <div className="print-metric-card"><div className="print-metric-label">Tiempo estimado</div><div className="print-metric-value">~{estimatedMonths} meses</div></div>
          <div className="print-metric-card"><div className="print-metric-label">Costo por m²</div><div className="print-metric-value">{formatCurrency(perM2)}</div></div>
        </div>

        <div className="print-section-title"><div className="print-section-bar" /><span>CONFIGURACIÓN GENERAL</span></div>
        {[
          ["Superficie total", `${area} m²`],
          ["Sistema constructivo", systemInfo?.label || "—"],
          ["Tiempo estimado de obra", `~${estimatedMonths} meses`],
          ["Lugar de construcción", getLabel(LOCATION_TYPES, stageSelections?.location)],
          ["Tipo de fundación", getLabel(FOUNDATION_TYPES, stageSelections?.foundation)],
          ["Cubierta / techo", getLabel(ROOFING_TYPES, stageSelections?.roofing)],
          ["Plantas", getLabel(FLOOR_TYPES, floors)],
          ...(!isObraGris ? [["Baños", getLabel(BATHROOM_CONFIG, stageSelections?.bathroom)]] : []),
        ].map(([label, value], i) => (
          <div key={label} className={`print-row ${i % 2 === 1 ? "shaded" : ""}`}>
            <span className="print-row-label">{label}</span>
            <span className="print-row-value">{value}</span>
          </div>
        ))}

        {!isObraGris && (
          <>
            <div className="print-section-title"><div className="print-section-bar" /><span>SANITARIOS E INSTALACIONES</span></div>
            {[
              ["Grifería", getLabel(PLUMBING_TYPES, stageSelections?.plumbing)],
              ["Artefactos sanitarios", getLabel(SANITARY_TYPES, stageSelections?.sanitary)],
              ["Calefacción", getLabel(HEATING_TYPES, stageSelections?.heating)],
              ["Instalación eléctrica", getLabel(ELECTRICAL_TYPES, stageSelections?.electrical)],
            ].map(([label, value], i) => (
              <div key={label} className={`print-row ${i % 2 === 1 ? "shaded" : ""}`}>
                <span className="print-row-label">{label}</span>
                <span className="print-row-value">{value}</span>
              </div>
            ))}

            <div className="print-section-title"><div className="print-section-bar" /><span>TERMINACIONES</span></div>
            {[
              ["Pisos", getLabel(FLOORING_TYPES, stageSelections?.flooring)],
              ["Revestimiento baños", getLabel(BATHROOM_CLADDING, stageSelections?.bathroomCladding)],
              ["Mesada de cocina", getLabel(KITCHEN_COUNTERTOP, stageSelections?.countertop)],
              ["Muebles de cocina", getLabel(KITCHEN_CABINETS, stageSelections?.cabinets)],
              ["Revestimientos de pared", getLabel(WALL_CLADDING, stageSelections?.wallCladding)],
              ["Carpintería / ventanas", getLabel(WINDOW_TYPES, stageSelections?.windows)],
              ["Carpintería de madera", getLabel(WOODWORK_TYPES, stageSelections?.woodwork)],
            ].map(([label, value], i) => (
              <div key={label} className={`print-row ${i % 2 === 1 ? "shaded" : ""}`}>
                <span className="print-row-label">{label}</span>
                <span className="print-row-value">{value}</span>
              </div>
            ))}
          </>
        )}

        {(stageSelections?.extras || []).length > 0 && (
          <>
            <div className="print-section-title"><div className="print-section-bar" /><span>EXTRAS Y ADICIONALES</span></div>
            {(stageSelections.extras || []).map((key, i) => {
              const ex = EXTRAS.find(e => e.key === key);
              return ex ? (
                <div key={key} className={`print-row ${i % 2 === 1 ? "shaded" : ""}`}>
                  <span className="print-row-label">{ex.label}</span>
                  <span className="print-row-value">+{formatCurrency(ex.costAdd)}</span>
                </div>
              ) : null;
            })}
          </>
        )}

        <div className="print-section-title"><div className="print-section-bar" /><span>DESGLOSE DE COSTOS</span></div>
        {[
          ["Estructura base", formatCurrency(baseResult.breakdown.structure || 0)],
          ...(!isObraGris ? [
            ["Terminaciones base", formatCurrency(baseResult.breakdown.finishes || 0)],
            ...((baseResult.breakdown.floors || 0) > 0 ? [["Adicional 2 plantas", formatCurrency(baseResult.breakdown.floors)]] : []),
            ["Detalles de etapas", formatCurrency(stagesResult.total || 0)],
          ] : [
            ...((baseResult.breakdown.floors || 0) > 0 ? [["Adicional 2 plantas", formatCurrency(baseResult.breakdown.floors)]] : []),
          ]),
          ["Permisos y conexiones", formatCurrency(baseResult.breakdown.extras || 0)],
        ].map(([label, value], i) => (
          <div key={label} className={`print-row ${i % 2 === 1 ? "shaded" : ""}`}>
            <span className="print-row-label">{label}</span>
            <span className="print-row-value">{value}</span>
          </div>
        ))}
        <div className="print-total-row">
          <span>TOTAL ESTIMADO</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>

        <div className="print-section-title"><div className="print-section-bar" /><span>CRONOGRAMA DE DESEMBOLSOS (ESTIMADO)</span></div>
        {PAYMENT_STAGES.map((s, i) => (
          <div key={s.label} className={`print-row ${i % 2 === 1 ? "shaded" : ""}`}>
            <span className="print-row-label">{s.label}</span>
            <span className="print-row-value">{formatCurrency(Math.round(grandTotal * s.pct))}</span>
          </div>
        ))}

        <div className="print-disclaimer">
          <div>* Presupuesto orientativo. Puede variar según condiciones del terreno, ubicación y costos de materiales.</div>
          <div>  Los valores están expresados en dólares estadounidenses (USD).</div>
          <div style={{ marginTop: "4px" }}>TOBYCO Constructora · info@tobyco.com.ar · +54 9 11 4041-9044</div>
        </div>
        <div className="print-footer">
          <span>TOBYCO Constructora · www.tobycoconstructora.com.ar</span>
          <span>Fecha: {today}</span>
        </div>
      </div>

      {/* ── Screen area ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl font-display font-semibold">Resumen de tu proyecto</h2>
          <p className="text-sm text-muted-foreground">Revisá tu configuración y descargá el presupuesto en PDF</p>
        </div>

        {/* Real-time budget breakdown */}
        <BudgetBreakdownCard area={area} system={system} stageSelections={stageSelections} />

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <SummaryCard label="Superficie" value={`${area} m²`} />
          <SummaryCard label="Sistema" value={systemInfo?.label || "-"} />
          <SummaryCard label="Baños" value={getLabel(BATHROOM_CONFIG, stageSelections?.bathroom)} />
          <SummaryCard label="Tiempo est." value={`~${estimatedMonths} meses`} />
        </div>

        {/* Full config overview */}
        <div className="bg-card border rounded-xl p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold">Configuración seleccionada</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <ConfigRow label="Ubicación" value={getLabel(LOCATION_TYPES, stageSelections?.location)} />
            <ConfigRow label="Fundación" value={getLabel(FOUNDATION_TYPES, stageSelections?.foundation)} />
            <ConfigRow label="Cubierta" value={getLabel(ROOFING_TYPES, stageSelections?.roofing)} />
            <ConfigRow label="Plantas" value={getLabel(FLOOR_TYPES, floors)} />
            {!isObraGris && (
              <>
                <ConfigRow label="Grifería" value={getLabel(PLUMBING_TYPES, stageSelections?.plumbing)} />
                <ConfigRow label="Artefactos" value={getLabel(SANITARY_TYPES, stageSelections?.sanitary)} />
                <ConfigRow label="Pisos" value={getLabel(FLOORING_TYPES, stageSelections?.flooring)} />
                <ConfigRow label="Mesada" value={getLabel(KITCHEN_COUNTERTOP, stageSelections?.countertop)} />
                <ConfigRow label="Muebles cocina" value={getLabel(KITCHEN_CABINETS, stageSelections?.cabinets)} />
                <ConfigRow label="Revestimientos" value={getLabel(WALL_CLADDING, stageSelections?.wallCladding)} />
                <ConfigRow label="Revestim. baños" value={getLabel(BATHROOM_CLADDING, stageSelections?.bathroomCladding)} />
                <ConfigRow label="Ventanas" value={getLabel(WINDOW_TYPES, stageSelections?.windows)} />
                <ConfigRow label="Carpintería madera" value={getLabel(WOODWORK_TYPES, stageSelections?.woodwork)} />
              </>
            )}
            <ConfigRow label="Calefacción" value={getLabel(HEATING_TYPES, stageSelections?.heating)} />
            <ConfigRow label="Inst. eléctrica" value={getLabel(ELECTRICAL_TYPES, stageSelections?.electrical)} />
            {(stageSelections?.extras || []).length > 0 && (
              <ConfigRow label="Extras" value={(stageSelections.extras).map(k => getLabel(EXTRAS, k)).join(", ")} />
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-card border rounded-xl p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold text-lg">Desglose de costos</h3>
          <div className="space-y-2">
            <BreakdownRow label="Estructura" amount={baseResult.breakdown.structure} />
            <BreakdownRow label="Terminaciones base" amount={baseResult.breakdown.finishes} />
            {(baseResult.breakdown.floors || 0) > 0 && (
              <BreakdownRow label="Adicional 2 plantas" amount={baseResult.breakdown.floors} />
            )}
            <BreakdownRow label="Detalles de etapas" amount={stagesResult.total} />
            <BreakdownRow label="Permisos y conexiones" amount={baseResult.breakdown.extras} />
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-bold text-lg">Total estimado</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="text-right text-sm text-muted-foreground flex items-center justify-end gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{formatCurrency(perM2)}/m²</span>
              <span>·</span>
              <a href="https://www.tobycoconstructora.com.ar" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Ver opciones de financiación</a>
            </div>
          </div>
        </div>

        {/* Gantt Chart — Premium */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Diagrama de Gantt — Cronograma de obra
            {!pdfUnlocked && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Crown className="w-3 h-3" />Premium</span>}
          </h3>
          {pdfUnlocked ? (
            <GanttChart system={system} totalMonths={systemInfo?.timeMonths || 8} totalCost={grandTotal} />
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              <div className="blur-sm pointer-events-none select-none opacity-60">
                <GanttChart system={system} totalMonths={systemInfo?.timeMonths || 8} totalCost={grandTotal} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <div className="text-center">
                  <Lock className="w-6 h-6 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium text-foreground">Contenido Premium</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        <AIRecommendation area={area} system={system} finishMode={finishMode} finishTier={finishTier} total={grandTotal} />

        {/* Premium PDF Gate */}
        {isAuthenticated && !pdfUnlocked && (
        <PremiumPDFGate onUnlocked={() => setLocalUnlocked(true)} />
)}
        {/* Auth notice */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
          >
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 text-sm text-amber-800">
              <span className="font-semibold">Iniciá sesión</span> para descargar el PDF, imprimir o enviar tu presupuesto.
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 border-amber-400 text-amber-700 hover:bg-amber-100" onClick={() => navigateToLogin()}>
              <LogIn className="w-3.5 h-3.5" /> Ingresar
            </Button>
          </motion.div>
        )}

        {/* Contact Form — shown above buttons when open */}
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Solicitar cotización formal</h3>
              <button onClick={() => setShowContactForm(false)} className="p-1 rounded-full hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nombre completo *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
              <Input placeholder="Email *" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
              <Input placeholder="Teléfono" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
            </div>
            <Textarea placeholder="Mensaje adicional..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
            <div className="flex gap-3 justify-end flex-wrap">
              <Button variant="outline" onClick={() => setShowContactForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmitLead} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar consulta
              </Button>
            </div>
          </motion.div>
        )}

        {/* Saved banner */}
        {savedBanner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <Save className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 text-sm font-medium text-green-800">Tu configuración ha sido guardada exitosamente.</div>
            <button
              type="button"
              onClick={() => setSavedBanner(false)}
              className="p-1.5 rounded-full hover:bg-green-200 transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4 text-green-700" />
            </button>
          </motion.div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-4 lg:pb-0">
          <div className="flex flex-wrap gap-2 justify-center">
            {pdfUnlocked ? (
              <>
                <Button
                  onClick={handleExportPDF}
                  disabled={generatingPDF}
                  className="gap-2 bg-primary hover:bg-primary/90 h-9 font-semibold"
                >
                  {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Descargar PDF
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
                  <Printer className="w-4 h-4" /> Imprimir
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2">
                <Lock className="w-4 h-4" />
                PDF disponible tras el pago
              </div>
            )}
            <Button onClick={handleShowContact} variant="outline" size="sm" className="gap-2">
              <Send className="w-4 h-4" /> Solicitar cotización
            </Button>
            <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar proyecto
            </Button>
          </div>
        </div>

        {pdfBanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 z-50 bg-accent text-accent-foreground rounded-xl shadow-lg px-5 py-3 flex items-center gap-4"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">PDF generado</div>
              <div className="text-xs opacity-80">El presupuesto fue descargado exitosamente.</div>
            </div>
            <button onClick={() => setPdfBanner(false)} className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="flex justify-start pb-24 lg:pb-0">
          <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Modificar
          </Button>
        </div>
      </motion.div>
    </>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-4 text-center">
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="font-bold text-sm mt-1 leading-snug">{value}</div>
    </div>
  );
}

function BreakdownRow({ label, amount }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatCurrency(amount || 0)}</span>
    </div>
  );
}

function ConfigRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-0.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground flex-shrink-0 text-xs sm:text-sm">{label}</span>
      <span className="font-medium text-right text-xs sm:text-sm leading-snug">{value || "—"}</span>
    </div>
  );
}