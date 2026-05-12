import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CONSTRUCTION_SYSTEMS, OBRA_GRIS_SYSTEMS, formatCurrency } from "@/lib/pricingData";
import {
  EXTRAS, LOCATION_TYPES, FOUNDATION_TYPES, ROOFING_TYPES, BATHROOM_CONFIG,
  PLUMBING_TYPES, SANITARY_TYPES, FLOORING_TYPES, KITCHEN_COUNTERTOP,
  KITCHEN_CABINETS, WALL_CLADDING, BATHROOM_CLADDING, WINDOW_TYPES,
  HEATING_TYPES, WOODWORK_TYPES, ELECTRICAL_TYPES,
} from "@/lib/constructionStages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCw, AlertCircle, X, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

// ── All editable sections ───────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "construction_system",
    label: "Sistemas constructivos — Llave en mano",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: Object.values(CONSTRUCTION_SYSTEMS).map(s => ({
      config_key: `system_${s.key}`,
      category: "construction_system",
      label: s.label,
      value: s.costPerM2,
      description: s.description,
      metadata: { timeMonths: s.timeMonths, subtitle: s.subtitle },
    })),
  },
  {
    key: "obra_gris_systems",
    label: "Obra Gris — Costos por variante",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: Object.values(OBRA_GRIS_SYSTEMS).map(s => ({
      config_key: `system_${s.key}`,
      category: "construction_system",
      label: s.label,
      value: s.costPerM2,
      description: s.description,
      metadata: { timeMonths: s.timeMonths, subtitle: s.subtitle, isShell: true, baseSystem: s.baseSystem },
    })),
  },
  {
    key: "location",
    label: "Tipos de ubicación",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: LOCATION_TYPES.map(x => ({ config_key: `location_${x.key}`, category: "location", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "foundation",
    label: "Tipos de fundación",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: FOUNDATION_TYPES.map(x => ({ config_key: `foundation_${x.key}`, category: "foundation", label: x.label, value: x.costPerM2, description: x.description, metadata: {} })),
  },
  {
    key: "roofing",
    label: "Tipos de cubierta / techo",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: ROOFING_TYPES.map(x => ({ config_key: `roofing_${x.key}`, category: "roofing", label: x.label, value: x.costPerM2, description: x.description, metadata: {} })),
  },
  {
    key: "bathroom_config",
    label: "Configuración de baños",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: BATHROOM_CONFIG.map(x => ({ config_key: `bathroom_${x.key}`, category: "bathroom_config", label: x.label, value: x.costAdd, description: x.description, metadata: { bathrooms: x.bathrooms, toilets: x.toilets } })),
  },
  {
    key: "plumbing",
    label: "Grifería",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: PLUMBING_TYPES.map(x => ({ config_key: `plumbing_${x.key}`, category: "plumbing", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "sanitary",
    label: "Artefactos sanitarios",
    costField: "costPerBathroom",
    costLabel: "Costo por baño (USD)",
    items: SANITARY_TYPES.map(x => ({ config_key: `sanitary_${x.key}`, category: "sanitary", label: x.label, value: x.costPerBathroom, description: x.description, metadata: {} })),
  },
  {
    key: "flooring",
    label: "Pisos",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: FLOORING_TYPES.map(x => ({ config_key: `flooring_${x.key}`, category: "flooring", label: x.label, value: x.costPerM2, description: x.description, metadata: {} })),
  },
  {
    key: "bathroom_cladding",
    label: "Revestimiento de baños",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: BATHROOM_CLADDING.map(x => ({ config_key: `bath_cladding_${x.key}`, category: "bathroom_cladding", label: x.label, value: x.costPerM2, description: x.description, metadata: {} })),
  },
  {
    key: "countertop",
    label: "Mesadas de cocina",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: KITCHEN_COUNTERTOP.map(x => ({ config_key: `countertop_${x.key}`, category: "countertop", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "cabinets",
    label: "Muebles de cocina",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: KITCHEN_CABINETS.map(x => ({ config_key: `cabinets_${x.key}`, category: "cabinets", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "wall_cladding",
    label: "Revestimientos de pared",
    costField: "costPerM2",
    costLabel: "Costo por m²",
    items: WALL_CLADDING.map(x => ({ config_key: `wall_cladding_${x.key}`, category: "wall_cladding", label: x.label, value: x.costPerM2, description: x.description, metadata: {} })),
  },
  {
    key: "windows",
    label: "Carpintería / ventanas",
    costField: "costPerM2",
    costLabel: "Costo por m² abertura",
    items: WINDOW_TYPES.map(x => ({ config_key: `windows_${x.key}`, category: "windows", label: x.label, value: x.costPerM2, description: x.description, metadata: {} })),
  },
  {
    key: "heating",
    label: "Calefacción",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: HEATING_TYPES.map(x => ({ config_key: `heating_${x.key}`, category: "heating", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "woodwork",
    label: "Carpintería de madera",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: WOODWORK_TYPES.map(x => ({ config_key: `woodwork_${x.key}`, category: "woodwork", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "electrical",
    label: "Instalaciones eléctricas",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: ELECTRICAL_TYPES.map(x => ({ config_key: `electrical_${x.key}`, category: "electrical", label: x.label, value: x.costAdd, description: x.description, metadata: {} })),
  },
  {
    key: "extras",
    label: "Extras y adicionales",
    costField: "costAdd",
    costLabel: "Costo adicional (USD)",
    items: EXTRAS.map(x => ({ config_key: `extra_${x.key}`, category: "extras", label: x.label, value: x.costAdd, description: x.description, metadata: { enabled: true } })),
  },
  {
    key: "base_costs",
    label: "Costos base de la obra",
    costField: "value",
    costLabel: "Porcentaje (%)",
    items: [
      { config_key: "base_extras_pct", category: "base_costs", label: "Permisos, conexiones y gastos generales", value: 8, description: "% sobre subtotal (estructura + terminaciones)" },
      { config_key: "floors_double_pct", category: "base_costs", label: "Adicional planta baja + primer piso", value: 8, description: "% del costo base (m² × costo/m²) aplicado cuando se elige 2 plantas" },
      { config_key: "labor_ratio_traditional", category: "base_costs", label: "Ratio mano de obra — Tradicional", value: 40, description: "% del total que corresponde a mano de obra (sistema Tradicional)" },
      { config_key: "labor_ratio_steel_frame", category: "base_costs", label: "Ratio mano de obra — Steel Framing", value: 35, description: "% del total que corresponde a mano de obra (sistema Steel Framing)" },
      { config_key: "labor_ratio_obra_gris", category: "base_costs", label: "Ratio mano de obra — Obra Gris", value: 45, description: "% del total que corresponde a mano de obra (sistema Obra Gris)" },
      { config_key: "labor_ratio_mixed", category: "base_costs", label: "Ratio mano de obra — Sistema Mixto", value: 38, description: "% del total que corresponde a mano de obra (sistema Mixto)" },
    ],
  },
  {
    key: "stage_percentages",
    label: "Etapas del cronograma de desembolsos (%)",
    costField: "pct",
    costLabel: "Porcentaje del total (%)",
    items: [
      { config_key: "stage_pct_1", category: "stage_percentages", label: "Etapa 1 — Fundaciones y excavación", value: 12, description: "% del total abonado al inicio de fundaciones" },
      { config_key: "stage_pct_2", category: "stage_percentages", label: "Etapa 2 — Estructura / Esqueleto", value: 18, description: "% del total abonado al inicio de estructura" },
      { config_key: "stage_pct_3", category: "stage_percentages", label: "Etapa 3 — Cerramientos y cubierta", value: 15, description: "% del total abonado al inicio de cerramientos" },
      { config_key: "stage_pct_4", category: "stage_percentages", label: "Etapa 4 — Instalaciones eléctricas/sanitarias", value: 20, description: "% del total abonado al inicio de instalaciones" },
      { config_key: "stage_pct_5", category: "stage_percentages", label: "Etapa 5 — Terminaciones interiores", value: 25, description: "% del total abonado al inicio de terminaciones" },
      { config_key: "stage_pct_6", category: "stage_percentages", label: "Etapa 6 — Exteriores y entrega", value: 10, description: "% del total abonado en entrega final (parquización, veredas, pintura exterior)" },
    ],
  },
];

const ALL_DEFAULTS = SECTIONS.flatMap(s => s.items);

// ── Inline save notification ────────────────────────────────────────────────
function SavedNotice({ message, onClose }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-800 rounded-lg px-3 py-1.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-1">
      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{message}</span>
      <button type="button" onClick={onClose} className="ml-1 hover:opacity-70">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Row editor ─────────────────────────────────────────────────────────────
function PriceRow({ record, costLabel, onSave, saving }) {
  const [label, setLabel] = useState(record.label || "");
  const [value, setValue] = useState(record.value ?? 0);
  const [description, setDescription] = useState(record.description || "");
  const [dirty, setDirty] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  const change = (setter) => (e) => { setter(e.target.value); setDirty(true); setSavedMsg(null); };

  const handleSave = () => {
    onSave(
      { ...record, label, value: Number(value), description },
      (savedLabel) => {
        setDirty(false);
        setSavedMsg(`"${savedLabel}" guardado`);
      }
    );
  };

  return (
    <div className={`border rounded-xl p-3 space-y-2.5 transition-colors ${dirty ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_1fr_auto] gap-2 items-end">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Nombre visible</label>
          <Input value={label} onChange={change(setLabel)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">{costLabel}</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
            <Input type="number" value={value} onChange={change(setValue)} className="h-8 text-sm pl-5" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Descripción</label>
          <Input value={description} onChange={change(setDescription)} className="h-8 text-sm" />
        </div>
        <div className="flex items-end gap-2 pb-0">
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty} className="gap-1.5 h-8 whitespace-nowrap">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Guardar
          </Button>
        </div>
      </div>
      {savedMsg && (
        <SavedNotice message={savedMsg} onClose={() => setSavedMsg(null)} />
      )}
    </div>
  );
}

// ── Collapsible section ─────────────────────────────────────────────────────
function EditorSection({ section, dbConfigs, onSave, savingKey }) {
  const [open, setOpen] = useState(section.key === "construction_system");

  const merged = section.items.map(def => {
    const db = dbConfigs.find(r => r.config_key === def.config_key);
    return db ? { ...def, ...db } : def;
  });

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/40 hover:bg-secondary/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{section.label}</span>
          <Badge variant="secondary" className="text-[10px]">{merged.length} ítems</Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-background">
          {merged.map(rec => (
            <PriceRow
              key={rec.config_key}
              record={rec}
              costLabel={section.costLabel}
              onSave={onSave}
              saving={savingKey === rec.config_key}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PricingEditor() {
  const queryClient = useQueryClient();
  const [savingKey, setSavingKey] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: () => base44.entities.BuildConfig.list("-created_date", 500),
  });

  const totalExpected = ALL_DEFAULTS.length;
  const needsSeed = configs.length < totalExpected;

  const seedDefaults = async () => {
    setSeeding(true);
    const existing = new Set(configs.map(c => c.config_key));
    const toCreate = ALL_DEFAULTS.filter(row => !existing.has(row.config_key));
    if (toCreate.length === 0) {
      setGlobalMsg("Todo al día — no hay registros faltantes.");
      setSeeding(false);
      return;
    }
    for (const row of toCreate) {
      await base44.entities.BuildConfig.create(row);
    }
    queryClient.invalidateQueries({ queryKey: ["buildconfigs"] });
    setGlobalMsg(`${toCreate.length} registros inicializados correctamente.`);
    setSeeding(false);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ record, onDone }) => {
      setSavingKey(record.config_key);
      if (record.id) {
        await base44.entities.BuildConfig.update(record.id, {
          label: record.label,
          value: record.value,
          description: record.description,
          metadata: record.metadata,
        });
      } else {
        await base44.entities.BuildConfig.create(record);
      }
      return { label: record.label, onDone };
    },
    onSuccess: ({ label, onDone }) => {
      queryClient.invalidateQueries({ queryKey: ["buildconfigs"] });
      onDone?.(label);
      setSavingKey(null);
    },
    onError: () => {
      setGlobalMsg("Error al guardar. Intentá de nuevo.");
      setSavingKey(null);
    },
  });

  const handleSave = (record, onDone) => {
    saveMutation.mutate({ record, onDone });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando configuración...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Editor de precios e ítems</h2>
          <p className="text-sm text-muted-foreground">Editá nombre, costo y descripción de cada ítem del configurador.</p>
        </div>
        <Button variant="outline" size="sm" onClick={seedDefaults} disabled={seeding} className="gap-2">
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Inicializar desde código
        </Button>
      </div>

      {/* Global notice */}
      {globalMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{globalMsg}</span>
          <button type="button" onClick={() => setGlobalMsg(null)}><X className="w-4 h-4 hover:opacity-70" /></button>
        </div>
      )}

      {/* Seed warning */}
      {needsSeed && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Faltan {totalExpected - configs.length} registros en la base de datos.</strong>{" "}
            Hacé clic en <em>"Inicializar desde código"</em> para crearlos y poder editarlos.
          </div>
        </div>
      )}

      {/* All sections */}
      <div className="space-y-3">
        {SECTIONS.map(section => (
          <EditorSection
            key={section.key}
            section={section}
            dbConfigs={configs}
            onSave={handleSave}
            savingKey={savingKey}
          />
        ))}
      </div>
    </div>
  );
}