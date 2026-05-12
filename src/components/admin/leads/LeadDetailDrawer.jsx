import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Mail, Phone, User, Bell, FileText, Save, Calendar, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/pricingData";
import { STATUS_CONFIG } from "@/lib/leadConfig";

export default function LeadDetailDrawer({ lead, onClose, onUpdate }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date ?? "");
  const [followUpNote, setFollowUpNote] = useState(lead.follow_up_note ?? "");
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to ?? "");
  const [status, setStatus] = useState(lead.status ?? "new");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync when lead changes
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

  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <div className="font-bold text-lg leading-tight">{lead.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Consulta recibida {lead.created_date ? format(new Date(lead.created_date), "dd/MM/yyyy") : ""}
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Contact info */}
          <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Datos del cliente</div>
            <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" />{lead.email}</div>
            {lead.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" />{lead.phone}</div>}
            {lead.total_price && (
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <DollarSign className="w-4 h-4" />{formatCurrency(lead.total_price)}
              </div>
            )}
            {lead.configuration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                {lead.configuration.area ? `${lead.configuration.area} m²` : ""}
                {lead.configuration.system ? ` · ${lead.configuration.system}` : ""}
              </div>
            )}
            {lead.message && (
              <div className="text-sm text-muted-foreground pt-1 border-t mt-2">
                <span className="font-medium text-foreground">Mensaje:</span> {lead.message}
              </div>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Estado del lead</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
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
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Nombre del responsable..."
              className="h-9 text-sm"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              <FileText className="w-3 h-3 inline mr-1" /> Notas internas
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas del equipo comercial..."
              className="text-sm resize-none h-28"
            />
          </div>

          {/* Seguimiento */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Recordatorio de seguimiento
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Fecha</label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Descripción del recordatorio</label>
              <Textarea
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="Ej: Llamar para confirmar visita a obra..."
                className="text-sm resize-none h-20"
              />
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