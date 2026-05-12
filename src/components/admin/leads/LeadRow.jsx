import { useState } from "react";
import { format } from "date-fns";
import { Bell, ChevronRight, Mail, Phone, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/pricingData";
import { STATUS_CONFIG } from "@/lib/leadConfig";
import { AnimatePresence } from "framer-motion";
import AccessCodeModal from "./AccessCodeModal";

export default function LeadRow({ lead, onUpdateStatus, onOpen }) {
  const status = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new;
  const today = new Date().toISOString().split("T")[0];
  const isFollowUpToday = lead.follow_up_date === today;
  const isOverdue = lead.follow_up_date && lead.follow_up_date < today;
  const [showCodeModal, setShowCodeModal] = useState(false);

  return (
    <>
      <tr className="hover:bg-secondary/20 transition-colors group">
        {/* Cliente */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{lead.name}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); setShowCodeModal(true); }}
            >
              <Key className="w-3 h-3" /> Código de acceso
            </Button>
          </div>
          <div className="text-xs text-muted-foreground md:hidden">{lead.email}</div>
          {lead.notes && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[200px]">
              📝 {lead.notes}
            </div>
          )}
        </td>

        {/* Contacto */}
        <td className="px-4 py-3 hidden md:table-cell">
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</div>
            {lead.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</div>}
          </div>
        </td>

        {/* Configuración */}
        <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
          {lead.configuration?.area ? `${lead.configuration.area} m²` : "-"}
          {lead.configuration?.system ? ` · ${lead.configuration.system}` : ""}
        </td>

        {/* Precio */}
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="font-semibold text-primary text-sm">
            {lead.total_price ? formatCurrency(lead.total_price) : "-"}
          </span>
        </td>

        {/* Estado */}
        <td className="px-4 py-3">
          <Select
            value={lead.status || "new"}
            onValueChange={onUpdateStatus}
          >
            <SelectTrigger className="w-36 h-7 text-xs border-0 shadow-none p-0 gap-1 focus:ring-0">
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
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
        </td>

        {/* Seguimiento */}
        <td className="px-4 py-3 hidden md:table-cell">
          {lead.follow_up_date ? (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? "text-red-500" : isFollowUpToday ? "text-amber-600" : "text-muted-foreground"}`}>
              <Bell className="w-3 h-3" />
              {isFollowUpToday ? "Hoy" : isOverdue ? "Vencido" : format(new Date(lead.follow_up_date + "T12:00:00"), "dd/MM/yy")}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </td>

        {/* Fecha */}
        <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
          {lead.created_date ? format(new Date(lead.created_date), "dd/MM/yy") : "-"}
        </td>

        {/* Acción */}
        <td className="px-4 py-3">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onOpen}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </td>
      </tr>

      <AnimatePresence>
        {showCodeModal && (
          <AccessCodeModal lead={lead} onClose={() => setShowCodeModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}