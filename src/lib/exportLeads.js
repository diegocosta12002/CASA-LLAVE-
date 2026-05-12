import { STATUS_CONFIG } from "./leadConfig";

function escapeCSV(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportLeadsToExcel(leads) {
  const headers = [
    "Nombre", "Email", "Teléfono", "Estado", "Precio estimado",
    "Sistema", "Superficie (m²)", "Notas", "Fecha seguimiento",
    "Recordatorio", "Responsable", "Origen", "Fecha consulta"
  ];

  const rows = leads.map((l) => [
    l.name ?? "",
    l.email ?? "",
    l.phone ?? "",
    STATUS_CONFIG[l.status]?.label ?? l.status ?? "Nuevo",
    l.total_price ? `USD ${l.total_price}` : "",
    l.configuration?.system ?? "",
    l.configuration?.area ?? "",
    l.notes ?? "",
    l.follow_up_date ?? "",
    l.follow_up_note ?? "",
    l.assigned_to ?? "",
    l.source ?? "",
    l.created_date ? new Date(l.created_date).toLocaleDateString("es-AR") : "",
  ]);

  const csvContent =
    "sep=,\n" +
    [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_tobyco_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}