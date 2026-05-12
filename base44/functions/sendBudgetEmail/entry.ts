import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPANY_EMAIL = "info@tobyco.com.ar";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      clientName, clientEmail, clientPhone,
      area, systemLabel, grandTotal, perM2,
      estimatedMonths, floors,
      breakdown, stageSelections
    } = await req.json();

    const formatCurrency = (n) =>
      new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

    const body = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; }
  h1 { color: #c0483c; }
  h2 { color: #444; border-bottom: 2px solid #c0483c; padding-bottom: 6px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  td { padding: 7px 10px; font-size: 14px; }
  tr:nth-child(even) td { background: #f9f7f6; }
  .label { color: #888; width: 50%; }
  .value { font-weight: bold; }
  .total { background: #fff0ee !important; }
  .total td { font-size: 18px; color: #c0483c; font-weight: bold; }
  .footer { margin-top: 30px; font-size: 12px; color: #999; }
</style></head>
<body>

<h1>🏠 Nuevo presupuesto generado — TOBYCO</h1>
<p>Se generó y descargó un presupuesto PDF por un usuario del configurador.</p>

<h2>Datos del cliente</h2>
<table>
  <tr><td class="label">Nombre</td><td class="value">${clientName || "—"}</td></tr>
  <tr><td class="label">Email</td><td class="value">${clientEmail || "—"}</td></tr>
  <tr><td class="label">Teléfono</td><td class="value">${clientPhone || "—"}</td></tr>
</table>

<h2>Configuración del proyecto</h2>
<table>
  <tr><td class="label">Superficie</td><td class="value">${area} m²</td></tr>
  <tr><td class="label">Sistema constructivo</td><td class="value">${systemLabel || "—"}</td></tr>
  <tr><td class="label">Plantas</td><td class="value">${floors === "double" ? "2 plantas" : "1 planta"}</td></tr>
  <tr><td class="label">Tiempo estimado de obra</td><td class="value">~${estimatedMonths} meses</td></tr>
  <tr><td class="label">Costo por m²</td><td class="value">${formatCurrency(perM2)}</td></tr>
</table>

<h2>Desglose de costos</h2>
<table>
  <tr><td class="label">Estructura base</td><td class="value">${formatCurrency(breakdown?.structure)}</td></tr>
  <tr><td class="label">Terminaciones base</td><td class="value">${formatCurrency(breakdown?.finishes)}</td></tr>
  ${(breakdown?.floors || 0) > 0 ? `<tr><td class="label">Adicional 2 plantas</td><td class="value">${formatCurrency(breakdown?.floors)}</td></tr>` : ""}
  <tr><td class="label">Instalaciones y detalles</td><td class="value">${formatCurrency(breakdown?.stages)}</td></tr>
  <tr><td class="label">Permisos y conexiones</td><td class="value">${formatCurrency(breakdown?.extras)}</td></tr>
  <tr class="total"><td>TOTAL ESTIMADO</td><td>${formatCurrency(grandTotal)}</td></tr>
</table>

<h2>Selecciones del proyecto</h2>
<table>
  ${Object.entries(stageSelections || {})
    .filter(([k, v]) => v && k !== "extras")
    .map(([k, v], i) => `<tr><td class="label">${k}</td><td class="value">${v}</td></tr>`)
    .join("")}
  ${(stageSelections?.extras || []).length > 0
    ? `<tr><td class="label">Extras</td><td class="value">${stageSelections.extras.join(", ")}</td></tr>`
    : ""}
</table>

<div class="footer">
  <p>Usuario que descargó el PDF: ${user.email} | Fecha: ${new Date().toLocaleDateString("es-AR")}</p>
  <p>TOBYCO Constructora · info@tobyco.com.ar · +54 9 11 4041-9044</p>
</div>

</body>
</html>
`;

    await base44.integrations.Core.SendEmail({
      to: COMPANY_EMAIL,
      subject: `📋 Nuevo presupuesto: ${clientName || clientEmail} — ${area}m² ${systemLabel} — ${formatCurrency(grandTotal)}`,
      body,
    });

    console.log(`Budget email sent for client: ${clientEmail}, total: ${grandTotal}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error("sendBudgetEmail error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});