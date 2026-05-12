import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CONSTRUCTION_SYSTEMS, formatCurrency } from "@/lib/pricingData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CheckCircle2, X, RefreshCw, DollarSign, Clock } from "lucide-react";

const SYSTEMS = Object.values(CONSTRUCTION_SYSTEMS);

const OBRA_GRIS_SYSTEMS = [
  { key: "obra_gris_traditional", label: "Obra Gris Tradicional", subtitle: "Ladrillo hueco sin terminaciones", costPerM2: 890 },
  { key: "obra_gris_steel",       label: "Obra Gris Steel Framing", subtitle: "Steel framing sin terminaciones", costPerM2: 870 },
  { key: "obra_gris_mixed",       label: "Obra Gris Mixto", subtitle: "Sistema mixto sin terminaciones", costPerM2: 950 },
];

function SystemCard({ system, dbRecord, onSave, saving }) {
  const [costPerM2, setCostPerM2] = useState(dbRecord?.value ?? system.costPerM2);
  const [timeMonths, setTimeMonths] = useState(dbRecord?.metadata?.timeMonths ?? system.timeMonths);
  const [dirty, setDirty] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  const priceExample = Math.round(120 * costPerM2);

  const handleSave = () => {
    onSave(
      {
        id: dbRecord?.id,
        config_key: `comparator_system_${system.key}`,
        category: "comparator_system",
        label: system.label,
        value: Number(costPerM2),
        description: system.description,
        metadata: { timeMonths: Number(timeMonths), subtitle: system.subtitle },
      },
      () => { setDirty(false); setSavedMsg("Guardado correctamente"); }
    );
  };

  return (
    <div className={`border-2 rounded-xl p-5 space-y-4 transition-all ${dirty ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-base">{system.label}</div>
          <div className="text-xs text-muted-foreground">{system.subtitle}</div>
        </div>
        {dbRecord?.id ? (
          <Badge variant="secondary" className="text-[10px]">En BD</Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600">Sin inicializar</Badge>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Costo por m² (USD)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
            <Input
              type="number"
              value={costPerM2}
              onChange={(e) => { setCostPerM2(e.target.value); setDirty(true); setSavedMsg(null); }}
              className="pl-5 font-bold text-base"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Plazo estimado (meses)
          </label>
          <Input
            type="number"
            value={timeMonths}
            onChange={(e) => { setTimeMonths(e.target.value); setDirty(true); setSavedMsg(null); }}
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-secondary/40 rounded-lg px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Ejemplo 120 m²:</span>
        <span className="font-bold text-primary text-base">{formatCurrency(priceExample)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        {savedMsg ? (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 flex-1">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            {savedMsg}
            <button type="button" onClick={() => setSavedMsg(null)} className="ml-auto hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : <div className="flex-1" />}
        <Button size="sm" onClick={handleSave} disabled={saving || !dirty} className="gap-1.5">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar
        </Button>
      </div>
    </div>
  );
}

function ObraGrisCard({ system, dbRecord, onSave, saving }) {
  const [costPerM2, setCostPerM2] = useState(dbRecord?.value ?? system.costPerM2);
  const [dirty, setDirty] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  const handleSave = () => {
    onSave(
      {
        id: dbRecord?.id,
        config_key: `obra_gris_system_${system.key}`,
        category: "obra_gris_system",
        label: system.label,
        value: Number(costPerM2),
        description: system.subtitle,
        metadata: { subtitle: system.subtitle },
      },
      () => { setDirty(false); setSavedMsg("Guardado correctamente"); }
    );
  };

  return (
    <div className={`border-2 rounded-xl p-4 space-y-3 transition-all ${dirty ? "border-amber-400 bg-amber-50/40" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-sm">{system.label}</div>
          <div className="text-xs text-muted-foreground">{system.subtitle}</div>
        </div>
        {dbRecord?.id ? (
          <Badge variant="secondary" className="text-[10px]">En BD</Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600">Sin inicializar</Badge>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <DollarSign className="w-3 h-3" /> Costo por m² (USD)
        </label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
          <Input
            type="number"
            value={costPerM2}
            onChange={(e) => { setCostPerM2(e.target.value); setDirty(true); setSavedMsg(null); }}
            className="pl-5 font-bold"
          />
        </div>
      </div>
      <div className="bg-secondary/40 rounded-lg px-3 py-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">Ej. 120 m²:</span>
        <span className="font-bold text-primary">{formatCurrency(Math.round(120 * costPerM2))}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        {savedMsg ? (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1 flex-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {savedMsg}
            <button type="button" onClick={() => setSavedMsg(null)} className="ml-auto"><X className="w-3 h-3 hover:opacity-70" /></button>
          </div>
        ) : <div className="flex-1" />}
        <Button size="sm" onClick={handleSave} disabled={saving || !dirty} className="gap-1">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
        </Button>
      </div>
    </div>
  );
}

export default function SystemPricingEditor() {
  const queryClient = useQueryClient();
  const [savingKey, setSavingKey] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["comparator_configs"],
    queryFn: () => base44.entities.BuildConfig.filter({ category: "comparator_system" }),
    staleTime: 30_000,
  });

  const { data: ogConfigs = [], isLoading: isLoadingOG } = useQuery({
    queryKey: ["obra_gris_configs"],
    queryFn: () => base44.entities.BuildConfig.filter({ category: "obra_gris_system" }),
    staleTime: 30_000,
  });

  const seedSystems = async () => {
    setSeeding(true);
    const existingComp = new Set(configs.map(c => c.config_key));
    const existingOG = new Set(ogConfigs.map(c => c.config_key));
    const toCreate = [
      ...SYSTEMS.filter(s => !existingComp.has(`comparator_system_${s.key}`)).map(s => ({
        config_key: `comparator_system_${s.key}`,
        category: "comparator_system",
        label: s.label,
        value: s.costPerM2,
        description: s.description,
        metadata: { timeMonths: s.timeMonths, subtitle: s.subtitle },
      })),
      ...OBRA_GRIS_SYSTEMS.filter(s => !existingOG.has(`obra_gris_system_${s.key}`)).map(s => ({
        config_key: `obra_gris_system_${s.key}`,
        category: "obra_gris_system",
        label: s.label,
        value: s.costPerM2,
        description: s.subtitle,
        metadata: { subtitle: s.subtitle },
      })),
    ];
    for (const row of toCreate) {
      await base44.entities.BuildConfig.create(row);
    }
    queryClient.invalidateQueries({ queryKey: ["comparator_configs"] });
    queryClient.invalidateQueries({ queryKey: ["obra_gris_configs"] });
    setGlobalMsg(toCreate.length > 0 ? `${toCreate.length} sistemas inicializados.` : "Todo al día.");
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
      return { onDone };
    },
    onSuccess: ({ onDone }) => {
      queryClient.invalidateQueries({ queryKey: ["comparator_configs"] });
      onDone?.();
      setSavingKey(null);
    },
    onError: () => { setSavingKey(null); },
  });

  const handleSave = (record, onDone) => saveMutation.mutate({ record, onDone });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Precios de sistemas constructivos</h2>
          <p className="text-sm text-muted-foreground">
            Modificá el costo por m² de cada sistema para el <strong>Comparador de sistemas</strong> de la página principal. No afecta el presupuestador.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={seedSystems} disabled={seeding} className="gap-2">
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Inicializar valores
        </Button>
      </div>

      {globalMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{globalMsg}</span>
          <button type="button" onClick={() => setGlobalMsg(null)}><X className="w-4 h-4 hover:opacity-70" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SYSTEMS.map(system => {
          const dbRecord = configs.find(c => c.config_key === `comparator_system_${system.key}`);
          return (
            <SystemCard
              key={system.key}
              system={system}
              dbRecord={dbRecord}
              onSave={handleSave}
              saving={savingKey === `comparator_system_${system.key}`}
            />
          );
        })}
      </div>

      {/* Obra Gris section */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Precios Obra Gris</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Estos valores los usa el <strong>Asesor de IA</strong> para calcular cuánto construir en modalidad Obra Gris (sin terminaciones).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {OBRA_GRIS_SYSTEMS.map(sys => {
            const dbRecord = ogConfigs.find(c => c.config_key === `obra_gris_system_${sys.key}`);
            return (
              <ObraGrisCard
                key={sys.key}
                system={sys}
                dbRecord={dbRecord}
                onSave={handleSave}
                saving={savingKey === `obra_gris_system_${sys.key}`}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Nota:</strong> El "Costo estimado 120m²" en el comparador de sistemas se calcula como <em>120 × costo/m²</em>. Para editar otros costos (materiales, instalaciones, extras), usá la pestaña <strong>Editor de precios</strong>.
      </div>
    </div>
  );
}