import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Mail, Phone, User, Bell, FileText, Save, DollarSign, Home, Layers, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/pricingData";
import { STATUS_CONFIG } from "@/lib/leadConfig";
import {
  LOCATION_TYPES, FOUNDATION_TYPES, ROOFING_TYPES, BATHROOM_CONFIG,
  PLUMBING_TYPES, SANITARY_TYPES, FLOORING_TYPES, KITCHEN_COUNTERTOP,
  KITCHEN_CABINETS, WALL_CLADDING, WINDOW_TYPES, EXTRAS,
  BATHROOM_CLADDING, HEATING_TYPES, ELECTRICAL_TYPES, WOODWORK_TYPES, FLOOR_TYPES
} from "@/lib/constructionStages";

const getLabel = (list, key) => list?.find(x => x.key === key)?.label || key || "-";

const SYSTEM_LABELS = {
  traditional: "Tradicional",
  steel_frame: "Steel Framing",
  mixed: "Mixto",
  obra_gris_traditional: "Obra Gris Tradicional",
  obra_gris_steel: "Obra Gris Steel Framing",
  obra_gris_mixed: "Obra Gris Mixto",
};

function ConfigSection({ title, rows }) {
  if (!rows.some(([, v]) => v && v !== "-")) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>
      {rows.map(([label, value]) => value && value !== "-" ? (
        <div key={label} className="flex justify-between items-baseline text-xs py-0.5 border-b border-border/30 last:border-0">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-right max-w-[55%]">{value}</span>
        </div>
      ) : null)}
    </div>
  );
}

export default function BudgetLeadDetailDrawer({ lead, onClose, onUpdate }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date ?? "");
  const [followUpNote, setFollowUpNote] = useState(lead.follow_up_note ?? "");
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to ?? "");
  const [status, setStatus] = useState(lead.status ?? "new");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(lead.notes ?? "");
    setFollowUpDate(lead.follow_up_date ?? "");
    setFollowUpNote(lead.follow_up_note ?? "");
    setAssignedTo(lead.assigned_to ?? "");
    setStatus(lead.status ?? "new");
  }, [lead.id]);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({ notes, follow_up_date: followUpDate || null, follow_up_note: followUpNote, assigned_to: assignedTo, status });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cfg = lead.configuration || {};
  const isObraGris = cfg.system_key?.startsWith("obra_gris");
  const extras = cfg.extras || [];
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <div className="font-bold text-lg leading-tight">{lead.name || "Cliente sin nombre"}</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              {lead.created_date && <span>· {format(new Date(lead.created_date), "dd/MM/yyyy HH:mm")}</span>}
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Datos de contacto */}
          <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Datos del cliente</div>
            <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />{lead.email || "-"}</div>
            {lead.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />{lead.phone}</div>}
            {lead.total_price && (
              <div className="flex items-center gap-2 text-sm font-bold text-primary mt-1">
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                {formatCurrency(lead.total_price)}
                {cfg.area > 0 && lead.total_price > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    · {formatCurrency(Math.round(lead.total_price / cfg.area))}/m²
                  </span>
                )}
              </div>
            )}
            {lead.message && (
              <div className="text-sm text-muted-foreground pt-2 border-t mt-2">
                <span className="font-medium text-foreground">Mensaje: </span>{lead.message}
              </div>
            )}
          </div>

          {/* Configuración completa */}
          {cfg.area && (
            <div className="bg-card border rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Configuración del proyecto</span>
              </div>

              {/* Resumen principal */}
              <div className="grid grid-cols-3 gap-2 pb-3 border-b">
                <div className="text-center bg-secondary/40 rounded-lg p-2">
                  <div className="text-lg font-bold text-primary">{cfg.area} m²</div>
                  <div className="text-[10px] text-muted-foreground">Superficie</div>
                </div>
                <div className="text-center bg-secondary/40 rounded-lg p-2">
                  <div className="text-sm font-bold leading-tight">{SYSTEM_LABELS[cfg.system_key] || cfg.system || "-"}</div>
                  <div className="text-[10px] text-muted-foreground">Sistema</div>
                </div>
                <div className="text-center bg-secondary/40 rounded-lg p-2">
                  <div className="text-sm font-bold">{getLabel(FLOOR_TYPES, cfg.floors)}</div>
                  <div className="text-[10px] text-muted-foreground">Plantas</div>
                </div>
              </div>

              <ConfigSection
                title="General"
                rows={[
                  ["Ubicación", getLabel(LOCATION_TYPES, cfg.location)],
                  ["Fundación", getLabel(FOUNDATION_TYPES, cfg.foundation)],
                  ["Cubierta", getLabel(ROOFING_TYPES, cfg.roofing)],
                  ["Baños", getLabel(BATHROOM_CONFIG, cfg.bathroom)],
                ]}
              />

              {!isObraGris && (
                <>
                  <ConfigSection
                    title="Sanitarios e instalaciones"
                    rows={[
                      ["Grifería", getLabel(PLUMBING_TYPES, cfg.plumbing)],
                      ["Artefactos", getLabel(SANITARY_TYPES, cfg.sanitary)],
                      ["Calefacción", getLabel(HEATING_TYPES, cfg.heating)],
                      ["Inst. eléctrica", getLabel(ELECTRICAL_TYPES, cfg.electrical)],
                    ]}
                  />
                  <ConfigSection
                    title="Terminaciones"
                    rows={[
                      ["Pisos", getLabel(FLOORING_TYPES, cfg.flooring)],
                      ["Revestim. baños", getLabel(BATHROOM_CLADDING, cfg.bathroomCladding)],
                      ["Mesada cocina", getLabel(KITCHEN_COUNTERTOP, cfg.countertop)],
                      ["Muebles cocina", getLabel(KITCHEN_CABINETS, cfg.cabinets)],
                      ["Pared", getLabel(WALL_CLADDING, cfg.wallCladding)],
                      ["Ventanas", getLabel(WINDOW_TYPES, cfg.windows)],
                      ["Carpintería", getLabel(WOODWORK_TYPES, cfg.woodwork)],
                    ]}
                  />
                </>
              )}

              {extras.length > 0 && (
                <ConfigSection
                  title="Extras"
                  rows={extras.map(k => [getLabel(EXTRAS, k), "✓"])}
                />
              )}
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Estado del lead</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsable */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              <User className="w-3 h-3 inline mr-1" /> Responsable asignado
            </label>
            <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Nombre del responsable..." className="h-9 text-sm" />
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              <FileText className="w-3 h-3 inline mr-1" /> Notas internas
            </label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agregar notas del equipo comercial..." className="text-sm resize-none h-24" />
          </div>

          {/* Seguimiento */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Recordatorio de seguimiento
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Fecha</label>
              <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Descripción</label>
              <Textarea value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} placeholder="Ej: Llamar para confirmar visita a obra..." className="text-sm resize-none h-16" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-card">
          <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Guardando...</>
            ) : saved ? (
              <><span>✓</span> Guardado</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar cambios</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}