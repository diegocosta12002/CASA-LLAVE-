import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Home as HomeIcon, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { calculateTotal, formatCurrency } from "@/lib/pricingData";
import { base44 } from "@/api/base44Client";
import { calculateStagesCost, BATHROOM_CONFIG } from "@/lib/constructionStages";

import StepIndicator from "@/components/configurator/StepIndicator";
import SizeStep from "@/components/configurator/SizeStep";
import ModalityStep from "@/components/configurator/ModalityStep";
import SystemStep from "@/components/configurator/SystemStep";
import LocationFoundationStep from "@/components/configurator/LocationFoundationStep";
import PlumbingStep from "@/components/configurator/PlumbingStep";
import FinishDetailsStep from "@/components/configurator/FinishDetailsStep";
import ExtrasStep from "@/components/configurator/ExtrasStep";
import SummaryStep from "@/components/configurator/SummaryStep";
import PriceSidebar from "@/components/configurator/PriceSidebar";
import WhatsAppButton from "@/components/WhatsAppButton";
import TobyAssistant from "@/components/TobyAssistant";

const INITIAL_SELECTIONS = {
  location: "open", foundation: "strip", roofing: "metal_sheet", bathroom: "1bath",
  plumbing: "basic", sanitary: "basic", flooring: "ceramic", bathroomCladding: "ceramic_bath",
  countertop: "porcelain", cabinets: "none", wallCladding: "paint", wallCladdingM2: null,
  windows: "aluminum_single", heating: "none", electrical: "standard_elec", woodwork: "none", extras: [],
};

export default function Configurator() {
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1: size
  const [area, setArea] = useState(120);
  const [floors, setFloors] = useState("single");

  // Step 2: modality — "llave_en_mano" | "obra_gris"
  const [modality, setModality] = useState("llave_en_mano");
  // If obra_gris, which variant: "obra_gris_traditional" | "obra_gris_steel" | "obra_gris_mixed"
  const [obraGrisSystem, setObraGrisSystem] = useState(null);

  // Step 3: construction system (only for llave en mano)
  const [system, setSystem] = useState("traditional");

  // Steps 4-7: stage selections
  const [stageSelections, setStageSelections] = useState({ ...INITIAL_SELECTIONS });

  // The "active system key" used for pricing (obra gris variant OR selected llave en mano system)
  const activeSystemKey = modality === "obra_gris" ? obraGrisSystem : system;
  const isObraGris = modality === "obra_gris";

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Step navigation helpers
  // Llave en mano: 1 → 2(modality) → 3(system) → 4(location) → 5(plumbing) → 6(finishes) → 7(extras) → 8(summary)
  // Obra gris:     1 → 2(modality) →              3(location) →                               4(extras) → 5(summary)
  const getNextFromModality = () => {
    if (modality === "llave_en_mano") return 3;
    return 4; // obra_gris skips system step, goes to location
  };
  const getBackFromLocation = () => {
    if (modality === "llave_en_mano") return 3;
    return 2;
  };
  const nextStepFrom4 = isObraGris ? 7 : 5; // location -> extras (obra gris) or plumbing (llave en mano)
  const prevStepFrom7 = isObraGris ? 4 : 6; // extras back

  const handleModalityChange = (newModality) => {
    setModality(newModality);
    if (newModality === "obra_gris") setObraGrisSystem(null);
    setStageSelections({ ...INITIAL_SELECTIONS });
  };

  const handleSystemChange = (newSystem) => {
    setSystem(newSystem);
    setStageSelections({ ...INITIAL_SELECTIONS });
  };

  const handleAreaChange = (newArea) => {
    setArea(newArea);
    setStageSelections({ ...INITIAL_SELECTIONS });
  };

  // Finish mode kept for base price calc
  const finishMode = "simple";
  const finishTier = "standard";
  const finishDetails = {};

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg"
              alt="TOBYCO"
              className="h-9 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span style={{ display: "none" }} className="font-display font-bold text-lg">TOBYCO</span>
          </Link>
          <StepIndicator currentStep={step} />
          {/* User button — visible on mobile inside header */}
          <div className="flex-shrink-0 lg:hidden">
            {isAuthenticated ? (
              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1" onClick={() => logout()}>
                <LogOut className="w-3.5 h-3.5" /> Salir
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs gap-1" onClick={() => navigateToLogin()}>
                <User className="w-3.5 h-3.5" /> Entrar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <SizeStep
                  key="size"
                  area={area}
                  onAreaChange={handleAreaChange}
                  floors={floors}
                  onFloorsChange={setFloors}
                  onNext={() => setStep(2)}
                />
              ) : step === 2 ? (
                <ModalityStep
                  key="modality"
                  modality={modality}
                  obraGrisSystem={obraGrisSystem}
                  onModalityChange={handleModalityChange}
                  onObraGrisSystemChange={setObraGrisSystem}
                  area={area}
                  onNext={() => setStep(getNextFromModality())}
                  onBack={() => setStep(1)}
                />
              ) : step === 3 ? (
                <SystemStep
                  key="system"
                  selectedSystem={system}
                  area={area}
                  onSystemChange={handleSystemChange}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              ) : step === 4 ? (
                <LocationFoundationStep
                  key="location"
                  selections={stageSelections}
                  onChange={setStageSelections}
                  area={area}
                  isObraGris={isObraGris}
                  onNext={() => setStep(nextStepFrom4)}
                  onBack={() => setStep(getBackFromLocation())}
                />
              ) : step === 5 ? (
                <PlumbingStep
                  key="plumbing"
                  selections={stageSelections}
                  onChange={setStageSelections}
                  area={area}
                  onNext={() => setStep(6)}
                  onBack={() => setStep(4)}
                />
              ) : step === 6 ? (
                <FinishDetailsStep
                  key="finishes"
                  selections={stageSelections}
                  onChange={setStageSelections}
                  area={area}
                  onNext={() => setStep(7)}
                  onBack={() => setStep(5)}
                />
              ) : step === 7 ? (
                <ExtrasStep
                  key="extras"
                  selections={stageSelections}
                  onChange={setStageSelections}
                  onNext={() => setStep(8)}
                  onBack={() => setStep(prevStepFrom7)}
                />
              ) : step === 8 ? (
                <SummaryStep
                  key="summary"
                  area={area}
                  system={activeSystemKey}
                  finishMode={finishMode}
                  finishTier={finishTier}
                  finishDetails={finishDetails}
                  stageSelections={isObraGris ? {} : stageSelections}
                  floors={floors}
                  onBack={() => setStep(7)}
                />
              ) : null}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-4">
            <PriceSidebar
              area={area}
              system={activeSystemKey || system}
              finishMode={finishMode}
              finishTier={finishTier}
              finishDetails={finishDetails}
              stageSelections={isObraGris ? {} : stageSelections}
              floors={floors}
            />
          </div>
        </div>
      </div>

      <WhatsAppButton />
      <TobyAssistant />

      {/* User panel — desktop only floating, on mobile it's in the header area */}
      <div className="hidden lg:block fixed bottom-6 right-20 z-40">
        {isAuthenticated ? (
          <div className="bg-card border rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium max-w-[100px] truncate">{user?.full_name || user?.email}</span>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={() => logout()}>
              <LogOut className="w-3 h-3" /> Salir
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5 shadow-lg bg-card text-xs h-8" onClick={() => navigateToLogin()}>
            <User className="w-3.5 h-3.5" /> Ingresar
          </Button>
        )}
      </div>

      {/* Mobile price bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t px-4 py-3 z-50">
        <MobilePriceBar area={area} system={activeSystemKey || system} stageSelections={isObraGris ? {} : stageSelections} floors={floors} />
      </div>
    </div>
  );
}

function MobilePriceBar({ area, system, stageSelections, floors }) {
  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: () => base44.entities.BuildConfig.list("-created_date", 500),
    staleTime: 60_000,
  });
  const baseResult = calculateTotal(area, system, "simple", "standard", {}, dbConfigs, floors);
  const bathConfig = BATHROOM_CONFIG.find(b => b.key === stageSelections?.bathroom);
  const stagesResult = calculateStagesCost(stageSelections || {}, area, system, bathConfig, dbConfigs);
  const grandTotal = baseResult.total + stagesResult.total;
  const perM2 = grandTotal > 0 && area > 0 ? Math.round(grandTotal / area) : 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <div className="text-[10px] text-muted-foreground leading-none mb-0.5">Precio estimado</div>
        <div className="text-lg font-bold text-primary font-display leading-none">{formatCurrency(grandTotal)}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div className="text-[10px] text-muted-foreground">{area} m²</div>
        <div className="text-xs font-semibold text-foreground">{formatCurrency(perM2)}<span className="text-muted-foreground font-normal">/m²</span></div>
        <a href="https://www.tobycoconstructora.com.ar" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary underline">Ver financiación</a>
      </div>
    </div>
  );
}