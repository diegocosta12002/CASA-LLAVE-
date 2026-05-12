import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, FileText, Eye, ChevronRight, Building2, Hammer, Layers, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/pricingData";
import { STATUS_CONFIG } from "@/lib/leadConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BudgetLeadDetailDrawer from "./BudgetLeadDetailDrawer";
import { exportLeadsToExcel } from "@/lib/exportLeads";

const SYSTEM_ICONS = { traditional: Hammer, steel_frame: Layers, mixed: Zap };
const SYSTEM_LABELS = {
  traditional: "Tradicional",
  steel_frame: "Steel Framing",
  mixed: "Mixto",
  obra_gris_traditional: "Obra Gris Trad.",
  obra_gris_steel: "Obra Gris Steel",
  obra_gris_mixed: "Obra Gris Mixto",
};

export default function BudgetLeadsCRM() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["budget_leads"],
    queryFn: () => base44.entities.Lead.filter({ source: "configurador" }, "-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget_leads"] }),
  });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search);
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted" || l.status === "quote_sent").length,
      closedWon: leads.filter((l) => l.status === "closed_won").length,
      avgTicket: leads.length > 0
        ? Math.round(leads.filter(l => l.total_price).reduce((s, l) => s + l.total_price, 0) / leads.filter(l => l.total_price).length)
        : 0,
    };
  }, [leads]);

  if (isLoading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Presupuestos del Configurador
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Presupuestos generados automáticamente · {leads.length} registros
          </p>
        </div>
        <Button variant="outline" className="gap-2 self-start sm:self-auto" onClick={() => exportLeadsToExcel(leads)}>
          <Download className="w-4 h-4" /> Exportar Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Sin contactar", value: stats.new, color: "text-blue-600" },
          { label: "En seguimiento", value: stats.contacted, color: "text-amber-600" },
          { label: "Ticket promedio", value: stats.avgTicket > 0 ? formatCurrency(stats.avgTicket) : "-", color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
            <div className={`text-xl font-bold font-display ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
            Todos
          </Button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <Button
              key={key}
              size="sm"
              variant={statusFilter === key ? "default" : "outline"}
              onClick={() => setStatusFilter(key)}
              className="gap-1.5"
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay presupuestos generados aún</p>
            <p className="text-sm mt-1">Los presupuestos se guardan automáticamente cuando los usuarios completan el configurador.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3">Configuración</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Presupuesto</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((lead) => {
                  const cfg = lead.configuration || {};
                  const sysKey = cfg.system_key;
                  const Icon = SYSTEM_ICONS[sysKey?.replace("obra_gris_", "")] ?? Building2;
                  const statusCfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new;
                  return (
                    <tr key={lead.id} className="hover:bg-secondary/20 transition-colors group cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{lead.name || <span className="text-muted-foreground italic">Sin nombre</span>}</div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {lead.phone || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-xs font-medium">{SYSTEM_LABELS[sysKey] || cfg.system || "-"}</span>
                        </div>
                        {cfg.area && (
                          <div className="text-xs text-muted-foreground mt-0.5">{cfg.area} m² · {cfg.floors === "double" ? "2 plantas" : "1 planta"}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="font-semibold text-primary text-sm">
                          {lead.total_price ? formatCurrency(lead.total_price) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={lead.status || "new"}
                          onValueChange={(val) => {
                            updateMutation.mutate({ id: lead.id, data: { status: val } });
                          }}
                        >
                          <SelectTrigger className="w-36 h-7 text-xs border-0 shadow-none p-0 gap-1 focus:ring-0" onClick={(e) => e.stopPropagation()}>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusCfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                              {statusCfg.label}
                            </span>
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
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {lead.created_date ? format(new Date(lead.created_date), "dd/MM/yy HH:mm") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLead && (
        <BudgetLeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(data) => {
            updateMutation.mutate({ id: selectedLead.id, data });
            setSelectedLead((prev) => ({ ...prev, ...data }));
          }}
        />
      )}
    </div>
  );
}