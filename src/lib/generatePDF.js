import jsPDF from "jspdf";
import { formatCurrency, CONSTRUCTION_SYSTEMS, getEstimatedMonths } from "@/lib/pricingData";
import {
  LOCATION_TYPES, FOUNDATION_TYPES, ROOFING_TYPES, BATHROOM_CONFIG,
  PLUMBING_TYPES, SANITARY_TYPES, FLOORING_TYPES, KITCHEN_COUNTERTOP,
  KITCHEN_CABINETS, WALL_CLADDING, WINDOW_TYPES, EXTRAS,
  BATHROOM_CLADDING, HEATING_TYPES, ELECTRICAL_TYPES, WOODWORK_TYPES, FLOOR_TYPES
} from "@/lib/constructionStages";

const LOGO_URL = "https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg";

// ── Palette — TOBYCO brand-aligned, pastel + vivid accents ────────────────
// Brand accent: warm coral/terracotta (TOBYCO red, softened)
const C_ACCENT      = [192,  72,  60];   // brand terracotta — buttons, bars, titles
const C_ACCENT_PALE = [252, 241, 239];   // blush pale — section header bg
const C_ACCENT_SOFT = [238, 206, 201];   // soft coral — borders, total row
const C_ACCENT_RULE = [210, 155, 148];   // muted coral — decorative rules

// Neutral text & backgrounds (warm-toned)
const C_GRAY_900    = [ 22,  20,  20];   // near-black — main headings & values
const C_GRAY_700    = [ 50,  47,  47];   // dark charcoal — body labels
const C_GRAY_500    = [ 95,  90,  90];   // medium — secondary / metadata text
const C_GRAY_300    = [200, 195, 193];   // light — borders / separators
const C_GRAY_100    = [246, 244, 243];   // very light warm — alternating rows
const C_GRAY_50     = [252, 251, 250];   // near-white warm — card backgrounds

const C_WHITE       = [255, 255, 255];

// Gantt stage colors — vivid pastels, high-impact, harmonious spectrum
const STAGE_COLORS = [
  [230,  90,  75],   // coral red    — Fundaciones
  [ 65, 145, 210],   // sky blue     — Estructura
  [ 60, 185, 140],   // mint green   — Cerramientos
  [245, 175,  50],   // golden amber — Instalaciones
  [155,  95, 200],   // violet       — Terminaciones
  [ 50, 190, 200],   // cyan teal    — Exteriores
];

function getLabel(list, key) {
  return list?.find(x => x.key === key)?.label || key || "—";
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve({ data: canvas.toDataURL("image/jpeg", 0.92), w: img.width, h: img.height });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function loadPdfAsImage(url) {
  return new Promise((resolve) => {
    const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    const WORKER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    function renderPdf() {
      const pdfjs = window.pdfjsLib;
      if (!pdfjs) { resolve(null); return; }
      pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC;
      pdfjs.getDocument({ url, cMapUrl: null, disableFontFace: false }).promise
        .then((pdf) => pdf.getPage(1))
        .then((page) => {
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          return page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise
            .then(() => {
              const ctx2 = canvas.getContext("2d");
              const imgData = ctx2.getImageData(0, 0, canvas.width, canvas.height);
              const d = imgData.data;
              for (let i = 0; i < d.length; i += 4) {
                const gray = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
                d[i] = d[i+1] = d[i+2] = gray;
              }
              ctx2.putImageData(imgData, 0, 0);
              resolve({ data: canvas.toDataURL("image/jpeg", 0.92), w: viewport.width, h: viewport.height });
            });
        })
        .catch((e) => { console.error("PDF render error:", e); resolve(null); });
    }

    if (window.pdfjsLib) {
      renderPdf();
    } else {
      const script = document.createElement("script");
      script.src = PDFJS_CDN;
      script.onload = renderPdf;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    }
  });
}

export async function generateProfessionalPDF({
  area, system, stageSelections, baseResult, stagesResult, grandTotal,
  clientData = {}, openForPrint = false, termsData = [], dbConfigs = [], floors = "single"
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = 210;
  const ph = 297;
  const M = 15;
  const CW = pw - M * 2;
  const HEADER_H = 26;
  const FOOTER_H = 10;
  const CONTENT_TOP = HEADER_H + 8;
  const CONTENT_BOTTOM = ph - FOOTER_H - 6;

  let y = CONTENT_TOP;

  const systemInfo = CONSTRUCTION_SYSTEMS[system];
  const isObraGris = system === "obra_gris";
  const estimatedMonths = getEstimatedMonths(system, area);
  const today = new Date().toLocaleDateString("es-AR");
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("es-AR");
  const perM2 = grandTotal > 0 && area > 0 ? Math.round(grandTotal / area) : 0;
  const logoInfo = await loadImage(LOGO_URL);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function sf(style, size, color) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    if (color) doc.setTextColor(...color);
  }

  function drawHeader() {
    // Clean white header
    doc.setFillColor(...C_WHITE);
    doc.rect(0, 0, pw, HEADER_H, "F");
    // Thin accent bottom rule
    doc.setFillColor(...C_ACCENT);
    doc.rect(0, HEADER_H - 0.8, pw, 0.8, "F");

    if (logoInfo) {
      const aspect = logoInfo.w / logoInfo.h;
      const maxW = 36, maxH = 13;
      let lw = maxW, lh = maxW / aspect;
      if (lh > maxH) { lh = maxH; lw = maxH * aspect; }
      doc.addImage(logoInfo.data, "JPEG", M, (HEADER_H - lh) / 2, lw, lh);
    } else {
      sf("bold", 16, C_ACCENT);
      doc.text("TOBYCO", M, 17);
    }

    sf("normal", 6, C_GRAY_500);
    doc.text("www.tobycoconstructora.com.ar", pw - M, 10, { align: "right" });
    doc.text("info@tobyco.com.ar  ·  +54 9 11 4041-9044", pw - M, 16, { align: "right" });
    sf("normal", 5.5, C_GRAY_300);
    doc.text(`Generado: ${today}`, pw - M, 22, { align: "right" });
  }

  function drawFooter(pageNum, totalPages) {
    // Light gray footer
    doc.setFillColor(...C_GRAY_100);
    doc.rect(0, ph - FOOTER_H, pw, FOOTER_H, "F");
    doc.setFillColor(...C_GRAY_300);
    doc.rect(0, ph - FOOTER_H, pw, 0.3, "F");
    sf("normal", 5.5, C_GRAY_500);
    doc.text(
      "TOBYCO Constructora  ·  www.tobycoconstructora.com.ar  ·  info@tobyco.com.ar  ·  +54 9 11 4041-9044",
      M, ph - 3.5
    );
    sf("bold", 5.5, C_GRAY_500);
    doc.text(`Pág. ${pageNum} / ${totalPages}`, pw - M, ph - 3.5, { align: "right" });
  }

  function addPage() {
    doc.addPage();
    y = CONTENT_TOP;
    drawHeader();
  }

  function ensureSpace(h) {
    if (y + h > CONTENT_BOTTOM) addPage();
  }

  // Section header: pale rose bg with muted terracotta left bar
  function sectionTitle(title) {
    ensureSpace(13);
    doc.setFillColor(...C_ACCENT_PALE);
    doc.rect(M, y, CW, 7.5, "F");
    doc.setFillColor(...C_ACCENT);
    doc.rect(M, y, 3, 7.5, "F");
    sf("bold", 7.5, C_GRAY_700);
    doc.text(title, M + 8, y + 5.4);
    y += 11;
  }

  // Data row: clean with optional alternating tint and light separator
  function dataRow(label, value, shade) {
    ensureSpace(7.5);
    if (shade) {
      doc.setFillColor(...C_GRAY_100);
      doc.rect(M, y, CW, 7, "F");
    }
    sf("normal", 7, C_GRAY_500);
    doc.text(label, M + 5, y + 4.8);
    sf("bold", 7, C_GRAY_900);
    doc.text(String(value), pw - M - 4, y + 4.8, { align: "right" });
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.15);
    doc.line(M, y + 7, pw - M, y + 7);
    y += 7;
  }

  // Total row: soft rose-bordered box
  function totalRow(label, value) {
    ensureSpace(16);
    y += 2;
    doc.setFillColor(...C_ACCENT_PALE);
    doc.setDrawColor(...C_ACCENT_SOFT);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, y, CW, 13, 1.5, 1.5, "FD");
    sf("bold", 10, C_GRAY_700);
    doc.text(label, M + 6, y + 9);
    sf("bold", 13, C_ACCENT);
    doc.text(String(value), pw - M - 5, y + 9, { align: "right" });
    y += 18;
  }

  // Metric card: soft warm card with pastel accent top strip
  function metricCard(label, value, x, w) {
    doc.setFillColor(248, 246, 244);
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, 20, 1.5, 1.5, "FD");
    // Soft accent top strip
    doc.setFillColor(...C_ACCENT_SOFT);
    doc.rect(x, y, w, 1.5, "F");
    sf("normal", 5.5, C_GRAY_500);
    doc.text(label.toUpperCase(), x + w / 2, y + 8, { align: "center" });
    sf("bold", 9.5, C_GRAY_900);
    doc.text(String(value), x + w / 2, y + 15.5, { align: "center" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Cover + Client + Configuration
  // ═══════════════════════════════════════════════════════════════════════════
  drawHeader();
  y = CONTENT_TOP;

  // Title banner — clean, light, professional
  doc.setFillColor(...C_GRAY_50);
  doc.setDrawColor(...C_GRAY_300);
  doc.setLineWidth(0.2);
  doc.rect(M, y, CW, 20, "FD");
  // Left accent bar
  doc.setFillColor(...C_ACCENT);
  doc.rect(M, y, 4, 20, "F");
  sf("bold", 18, C_GRAY_900);
  doc.text("PRESUPUESTO DE OBRA", M + 10, y + 8);
  sf("normal", 8.5, C_GRAY_500);
  doc.text("Casa Llave en Mano — TOBYCO Constructora", M + 10, y + 15);
  y += 26;

  // Client data block
  if (clientData.name || clientData.email || clientData.phone) {
    ensureSpace(30);
    const clientH = 26;
    doc.setFillColor(...C_GRAY_50);
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.2);
    doc.roundedRect(M, y, CW, clientH, 1.5, 1.5, "FD");
    doc.setFillColor(...C_ACCENT);
    doc.rect(M, y, 3, clientH, "F");

    sf("bold", 7, C_GRAY_700);
    doc.text("DATOS DEL CLIENTE", M + 8, y + 7);

    sf("normal", 6.5, C_GRAY_500);
    doc.text("Cliente:", M + 8, y + 14);
    sf("bold", 6.5, C_GRAY_900);
    doc.text(clientData.name || "—", M + 26, y + 14);

    if (clientData.email) {
      sf("normal", 6.5, C_GRAY_500);
      doc.text("Email:", M + 8, y + 20);
      sf("bold", 6.5, C_GRAY_900);
      doc.text(clientData.email, M + 26, y + 20);
    }
    if (clientData.phone) {
      sf("normal", 6.5, C_GRAY_500);
      doc.text("Teléfono:", M + CW / 2, y + 14);
      sf("bold", 6.5, C_GRAY_900);
      doc.text(clientData.phone, M + CW / 2 + 20, y + 14);
    }
    sf("normal", 6.5, C_GRAY_500);
    doc.text("Validez:", M + CW / 2, y + 20);
    sf("bold", 6.5, C_GRAY_900);
    doc.text(`${today} al ${validUntil}`, M + CW / 2 + 18, y + 20);

    y += clientH + 6;
  }

  // 4 metric cards
  const gap = 3;
  const cw4 = (CW - gap * 3) / 4;
  [
    { label: "Superficie",     value: `${area} m²` },
    { label: "Sistema",        value: systemInfo?.label || "—" },
    { label: "Plazo estimado", value: `~${estimatedMonths} meses` },
    { label: "Costo por m²",   value: formatCurrency(perM2) },
  ].forEach((m, i) => metricCard(m.label, m.value, M + i * (cw4 + gap), cw4));
  y += 26;

  // CONFIGURACIÓN GENERAL
  sectionTitle("CONFIGURACIÓN GENERAL");
  const generalRows = [
    ["Superficie total",      `${area} m²`],
    ["Sistema constructivo",  systemInfo?.label || "—"],
    ["Plazo estimado de obra", `~${estimatedMonths} meses`],
    ["Lugar de construcción", getLabel(LOCATION_TYPES, stageSelections?.location)],
    ["Tipo de fundación",     getLabel(FOUNDATION_TYPES, stageSelections?.foundation)],
    ["Cubierta / techo",      getLabel(ROOFING_TYPES, stageSelections?.roofing)],
    ["Cantidad de plantas",   getLabel(FLOOR_TYPES, floors)],
  ];
  if (!isObraGris) generalRows.push(["Baños y toilettes", getLabel(BATHROOM_CONFIG, stageSelections?.bathroom)]);
  generalRows.forEach(([l, v], i) => dataRow(l, v, i % 2 === 1));
  y += 5;

  if (!isObraGris) {
    sectionTitle("SANITARIOS E INSTALACIONES");
    [
      ["Grifería",              getLabel(PLUMBING_TYPES, stageSelections?.plumbing)],
      ["Artefactos sanitarios", getLabel(SANITARY_TYPES, stageSelections?.sanitary)],
      ["Calefacción",           getLabel(HEATING_TYPES, stageSelections?.heating)],
      ["Instalación eléctrica", getLabel(ELECTRICAL_TYPES, stageSelections?.electrical)],
    ].forEach(([l, v], i) => dataRow(l, v, i % 2 === 1));
    y += 5;

    sectionTitle("TERMINACIONES");
    [
      ["Pisos",                        getLabel(FLOORING_TYPES, stageSelections?.flooring)],
      ["Revestimiento de baños",        getLabel(BATHROOM_CLADDING, stageSelections?.bathroomCladding)],
      ["Mesada de cocina",              getLabel(KITCHEN_COUNTERTOP, stageSelections?.countertop)],
      ["Muebles de cocina",             getLabel(KITCHEN_CABINETS, stageSelections?.cabinets)],
      ["Revestimientos de pared",       getLabel(WALL_CLADDING, stageSelections?.wallCladding)],
      ["Carpintería metálica / vidrios", getLabel(WINDOW_TYPES, stageSelections?.windows)],
      ["Carpintería de madera",         getLabel(WOODWORK_TYPES, stageSelections?.woodwork)],
    ].forEach(([l, v], i) => dataRow(l, v, i % 2 === 1));
    y += 5;
  }

  if (isObraGris) {
    ensureSpace(20);
    doc.setFillColor(255, 252, 235);
    doc.setDrawColor(210, 170, 50);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 16, 1.5, 1.5, "FD");
    doc.setFillColor(200, 150, 30);
    doc.rect(M, y, 3, 16, "F");
    sf("bold", 7.5, [120, 80, 0]);
    doc.text("ALCANCE — OBRA GRIS", M + 8, y + 6.5);
    sf("normal", 6.5, [100, 70, 0]);
    doc.text("Incluye: fundación, estructura, revoques grueso y fino, cañerías (sin grifería) y cubierta.", M + 8, y + 12, { maxWidth: CW - 12 });
    y += 22;
  }

  const extras = stageSelections?.extras || [];
  if (extras.length > 0) {
    sectionTitle("EXTRAS Y ADICIONALES");
    extras.forEach((key, i) => {
      const ex = EXTRAS.find(e => e.key === key);
      if (ex) dataRow(ex.label, `+ ${formatCurrency(ex.costAdd)}`, i % 2 === 1);
    });
    y += 5;
  }

  // DESGLOSE DE COSTOS
  sectionTitle("DESGLOSE DE COSTOS");

  // Table header — soft warm gray
  ensureSpace(9);
  doc.setFillColor(90, 85, 83);
  doc.rect(M, y, CW, 8, "F");
  sf("bold", 7, C_WHITE);
  doc.text("CONCEPTO", M + 5, y + 5.5);
  doc.text("% TOTAL", M + CW * 0.6, y + 5.5, { align: "center" });
  doc.text("MONTO (USD)", pw - M - 4, y + 5.5, { align: "right" });
  y += 8;

  const detailRows = [
    { label: "Estructura base (" + (systemInfo?.label || "—") + ")", amount: baseResult.breakdown.structure || 0 },
    ...(!isObraGris ? [
      { label: "Terminaciones base", amount: baseResult.breakdown.finishes || 0 },
      ...((baseResult.breakdown.floors || 0) > 0 ? [{ label: "Adicional planta baja + 1° piso", amount: baseResult.breakdown.floors }] : []),
      { label: "Instalaciones sanitarias y detalles", amount: stagesResult.total || 0 },
    ] : [
      ...((baseResult.breakdown.floors || 0) > 0 ? [{ label: "Adicional planta baja + 1° piso", amount: baseResult.breakdown.floors }] : []),
    ]),
    { label: "Permisos, conexiones y gastos generales", amount: baseResult.breakdown.extras || 0 },
    ...extras.map(key => {
      const ex = EXTRAS.find(e => e.key === key);
      return ex ? { label: `Extra: ${ex.label}`, amount: ex.costAdd } : null;
    }).filter(Boolean),
  ];

  detailRows.forEach((row, i) => {
    ensureSpace(8);
    const pct = grandTotal > 0 ? ((row.amount / grandTotal) * 100).toFixed(1) : "0.0";
    const barFrac = grandTotal > 0 ? row.amount / grandTotal : 0;
    if (i % 2 === 1) {
      doc.setFillColor(...C_GRAY_100);
      doc.rect(M, y, CW, 8, "F");
    }
    sf("normal", 7, C_GRAY_700);
    doc.text(row.label, M + 5, y + 5.5, { maxWidth: CW * 0.5 });
    // Mini bar (gray track, red fill)
    const barX = M + CW * 0.52;
    const barMaxW = CW * 0.17;
    doc.setFillColor(...C_GRAY_300);
    doc.roundedRect(barX, y + 3, barMaxW, 2.5, 0.5, 0.5, "F");
    doc.setFillColor(...C_ACCENT);
    doc.roundedRect(barX, y + 3, barMaxW * barFrac, 2.5, 0.5, 0.5, "F");
    sf("normal", 6, C_GRAY_500);
    doc.text(`${pct}%`, M + CW * 0.72, y + 5.5, { align: "center" });
    sf("bold", 7, C_GRAY_900);
    doc.text(formatCurrency(row.amount), pw - M - 4, y + 5.5, { align: "right" });
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.15);
    doc.line(M, y + 8, pw - M, y + 8);
    y += 8;
  });
  y += 4;

  totalRow("TOTAL ESTIMADO", formatCurrency(grandTotal));

  sf("normal", 6.5, C_GRAY_500);
  doc.text(`Costo por m²: ${formatCurrency(perM2)}   ·   Financiación: www.tobycoconstructora.com.ar`, pw / 2, y, { align: "center" });
  y += 12;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — Cronograma + Desembolsos
  // ═══════════════════════════════════════════════════════════════════════════
  addPage();

  sf("bold", 13, C_GRAY_900);
  doc.text("CRONOGRAMA DE OBRA Y DESEMBOLSOS", pw / 2, y + 5, { align: "center" });
  doc.setFillColor(...C_ACCENT_RULE);
  doc.rect(pw / 2 - 28, y + 7.5, 56, 0.6, "F");
  y += 15;

  const totalM = estimatedMonths || 8;
  const rawTotal = 8;
  const scl = totalM / rawTotal;
  const getStagePct = (i) => {
    const rec = dbConfigs.find(c => c.config_key === `stage_pct_${i + 1}`);
    return rec?.value ?? [12, 18, 15, 20, 25, 10][i];
  };
  const ganttStages = [
    { name: "Fundaciones",   start: 0 * scl,   dur: 1.5 * scl, pct: getStagePct(0) },
    { name: "Estructura",    start: 1.5 * scl, dur: 2 * scl,   pct: getStagePct(1) },
    { name: "Cerramientos",  start: 3.5 * scl, dur: 1.5 * scl, pct: getStagePct(2) },
    { name: "Instalaciones", start: 5 * scl,   dur: 1.5 * scl, pct: getStagePct(3) },
    { name: "Terminaciones", start: 6 * scl,   dur: 1.5 * scl, pct: getStagePct(4) },
    { name: "Exteriores",    start: 7 * scl,   dur: 1 * scl,   pct: getStagePct(5) },
  ];

  const LABEL_W = 28;
  const ganttLeft = M + LABEL_W;
  const ganttW = CW - LABEL_W;
  const rowH = 8;

  ensureSpace(14 + ganttStages.length * rowH);
  sectionTitle("DIAGRAMA DE GANTT — CRONOGRAMA DE ETAPAS");

  // Background grid
  doc.setFillColor(...C_GRAY_50);
  doc.rect(ganttLeft, y, ganttW, ganttStages.length * rowH, "F");

  // Month tick marks
  sf("normal", 5, C_GRAY_500);
  for (let m = 0; m <= totalM; m++) {
    const x = ganttLeft + (m / totalM) * ganttW;
    if (x > pw - M) break;
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.1);
    doc.line(x, y, x, y + ganttStages.length * rowH);
    doc.text(`M${m}`, x, y - 1.5, { align: "center" });
  }

  ganttStages.forEach((stage, i) => {
    const rowY = y + i * rowH;
    const barX = Math.min(ganttLeft + (stage.start / totalM) * ganttW, pw - M - 2);
    const rawBarW = (stage.dur / totalM) * ganttW;
    const barW = Math.max(Math.min(rawBarW, pw - M - barX), 2);
    const col = STAGE_COLORS[i];

    // Alternating row tint
    if (i % 2 === 0) {
      doc.setFillColor(247, 247, 247);
      doc.rect(M, rowY, LABEL_W, rowH, "F");
    }

    sf("normal", 5.5, C_GRAY_700);
    doc.text(stage.name, M + 1, rowY + 5.5, { maxWidth: LABEL_W - 2 });

    doc.setFillColor(...col);
    doc.roundedRect(barX, rowY + 2, barW - 0.5, rowH - 4, 0.8, 0.8, "F");
    if (barW > 9) {
      sf("bold", 5, C_WHITE);
      doc.text(`${stage.pct}%`, barX + barW / 2, rowY + 6, { align: "center" });
    }
  });

  y += ganttStages.length * rowH + 5;

  // Legend
  sf("normal", 5.5, C_GRAY_500);
  const legendItemW = CW / 6;
  ganttStages.forEach((stage, i) => {
    const col = STAGE_COLORS[i];
    const lx = M + i * legendItemW;
    doc.setFillColor(...col);
    doc.roundedRect(lx, y, 3.5, 3, 0.5, 0.5, "F");
    doc.text(stage.name, lx + 5, y + 2.5, { maxWidth: legendItemW - 6 });
  });
  y += 10;

  sectionTitle("CRONOGRAMA DE DESEMBOLSOS ESTIMADO");

  const DEFAULT_STAGE_PCTS = [12, 18, 15, 20, 25, 10];
  const STAGE_LABELS = [
    "Etapa 1 — Fundaciones y excavación",
    "Etapa 2 — Estructura / Esqueleto",
    "Etapa 3 — Cerramientos y cubierta",
    "Etapa 4 — Instalaciones eléctricas/sanitarias",
    "Etapa 5 — Terminaciones interiores",
    "Etapa 6 — Exteriores y entrega",
  ];
  const disbursements = STAGE_LABELS.map((label, i) => {
    const rec = dbConfigs.find(c => c.config_key === `stage_pct_${i + 1}`);
    const pctVal = rec?.value ?? DEFAULT_STAGE_PCTS[i];
    return { label, pct: pctVal / 100 };
  });

  // Table header — soft warm gray
  doc.setFillColor(90, 85, 83);
  doc.rect(M, y, CW, 8, "F");
  sf("bold", 7, C_WHITE);
  doc.text("Etapa", M + 7, y + 5.5);
  doc.text("% del Total", M + CW * 0.55, y + 5.5);
  doc.text("Monto (USD)", pw - M - 3, y + 5.5, { align: "right" });
  y += 8;

  disbursements.forEach((s, i) => {
    const amount = Math.round(grandTotal * s.pct);
    if (i % 2 === 1) { doc.setFillColor(...C_GRAY_100); doc.rect(M, y, CW, 8, "F"); }
    const col = STAGE_COLORS[i];
    doc.setFillColor(...col);
    doc.circle(M + 3, y + 4, 1.5, "F");
    sf("normal", 7, C_GRAY_700);
    doc.text(s.label, M + 7, y + 5.5);
    const barStart = M + CW * 0.5;
    const barW = CW * 0.17;
    doc.setFillColor(...C_GRAY_300);
    doc.roundedRect(barStart, y + 2.8, barW, 2.5, 0.5, 0.5, "F");
    doc.setFillColor(...col);
    doc.roundedRect(barStart, y + 2.8, barW * s.pct * (1 / 0.25), 2.5, 0.5, 0.5, "F");
    sf("normal", 6.5, C_GRAY_500);
    doc.text(`${Math.round(s.pct * 100)}%`, barStart + barW + 2, y + 5.5);
    sf("bold", 7, C_GRAY_900);
    doc.text(formatCurrency(amount), pw - M - 3, y + 5.5, { align: "right" });
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.15);
    doc.line(M, y + 8, pw - M, y + 8);
    y += 8;
  });

  y += 4;
  totalRow("TOTAL INVERSIÓN", formatCurrency(grandTotal));

  // Materiales y mano de obra block
  const laborRatios = { traditional: 0.40, steel_frame: 0.35, obra_gris: 0.45, mixed: 0.38 };
  const laborRatioRec = dbConfigs.find(c => c.config_key === `labor_ratio_${system}`);
  const laborRatio = laborRatioRec ? laborRatioRec.value / 100 : (laborRatios[system] ?? 0.40);
  const laborAmt = Math.round(grandTotal * laborRatio);
  const materialAmt = grandTotal - laborAmt;

  ensureSpace(22);
  doc.setFillColor(...C_GRAY_50);
  doc.setDrawColor(...C_GRAY_300);
  doc.setLineWidth(0.2);
  doc.roundedRect(M, y, CW, 18, 1.5, 1.5, "FD");
  doc.setFillColor(...C_ACCENT);
  doc.rect(M, y, 3, 18, "F");
  sf("bold", 7, C_GRAY_700);
  doc.text("MATERIALES Y MANO DE OBRA (estimados según diseño)", M + 8, y + 6);
  const colW = CW / 2 - 6;
  // Materiales
  sf("normal", 6.5, C_GRAY_500);
  doc.text("Materiales:", M + 8, y + 12);
  sf("bold", 7, C_GRAY_900);
  doc.text(formatCurrency(materialAmt), M + 8 + 22, y + 12);
  sf("normal", 6, C_GRAY_500);
  doc.text(`(${Math.round((1 - laborRatio) * 100)}% del total)`, M + 8 + 22 + 22, y + 12);
  // Mano de obra
  sf("normal", 6.5, C_GRAY_500);
  doc.text("Mano de obra:", M + CW / 2 + 4, y + 12);
  sf("bold", 7, C_GRAY_900);
  doc.text(formatCurrency(laborAmt), M + CW / 2 + 4 + 26, y + 12);
  sf("normal", 6, C_GRAY_500);
  doc.text(`(${Math.round(laborRatio * 100)}% del total)`, M + CW / 2 + 4 + 26 + 22, y + 12);
  y += 24;

  // Two summary cards
  const infoW = (CW - 4) / 2;
  metricCard("Costo por m²", formatCurrency(perM2), M, infoW);
  metricCard("Plazo total estimado", `~${estimatedMonths} meses`, M + infoW + 4, infoW);
  y += 26;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — Floor plan
  // ═══════════════════════════════════════════════════════════════════════════
  addPage();

  sf("bold", 13, C_GRAY_900);
  doc.text("PLANO DE PLANTA — MODELO DE REFERENCIA", pw / 2, y + 5, { align: "center" });
  doc.setFillColor(...C_ACCENT_RULE);
  doc.rect(pw / 2 - 33, y + 7.5, 66, 0.6, "F");
  y += 15;

  const planSize = area < 100 ? 80 : area < 150 ? 120 : 180;
  const planUrls = {
    80:  "https://media.base44.com/files/public/69c56c4515a812726693b5c3/f3881ebc4_OBRA80m2-Model.pdf",
    120: "https://media.base44.com/files/public/69c56c4515a812726693b5c3/22af78702_casamodelo120m2PDE.pdf",
    180: "https://media.base44.com/files/public/69c56c4515a812726693b5c3/859e71cf3_casamodelo2PDE180M2.pdf",
  };
  const planLabels = { 80: "Casa Compacta — 80 m²", 120: "Casa Familiar — 120 m²", 180: "Casa Premium — 180 m²" };

  ensureSpace(18);
  doc.setFillColor(...C_GRAY_50);
  doc.setDrawColor(...C_GRAY_300);
  doc.setLineWidth(0.2);
  doc.roundedRect(M, y, CW, 14, 1.5, 1.5, "FD");
  doc.setFillColor(...C_ACCENT);
  doc.rect(M, y, 3, 14, "F");
  sf("bold", 7, C_GRAY_700);
  doc.text("PLANO DE REFERENCIA", M + 8, y + 5.5);
  sf("normal", 6.5, C_GRAY_500);
  doc.text(`Modelo: ${planLabels[planSize]}  ·  Superficie: ${area} m²  ·  Plano orientativo, sujeto a proyecto final.`, M + 8, y + 11, { maxWidth: CW - 12 });
  y += 20;

  try {
    const planImgInfo = await loadPdfAsImage(planUrls[planSize]);
    if (planImgInfo) {
      const maxW = CW;
      const maxH = 178;
      const aspect = planImgInfo.w / planImgInfo.h;
      let iw = maxW, ih = maxW / aspect;
      if (ih > maxH) { ih = maxH; iw = maxH * aspect; }
      const ix = M + (CW - iw) / 2;
      doc.setDrawColor(...C_GRAY_300);
      doc.setLineWidth(0.3);
      doc.rect(ix - 1, y - 1, iw + 2, ih + 2);
      doc.addImage(planImgInfo.data, "JPEG", ix, y, iw, ih);

      // Watermark logo centered over the plan — use canvas for opacity effect
      if (logoInfo) {
        const wmW = 45;
        const wmH = wmW / (logoInfo.w / logoInfo.h);
        const wmX = ix + (iw - wmW) / 2;
        const wmY = y + (ih - wmH) / 2;
        // Create watermark canvas with reduced opacity
        const wmCanvas = document.createElement("canvas");
        wmCanvas.width = Math.round(wmW * 4);
        wmCanvas.height = Math.round(wmH * 4);
        const wmCtx = wmCanvas.getContext("2d");
        wmCtx.globalAlpha = 0.15;
        const tmpImg = new Image();
        await new Promise(res => {
          tmpImg.onload = res;
          tmpImg.onerror = res;
          tmpImg.src = logoInfo.data;
        });
        wmCtx.drawImage(tmpImg, 0, 0, wmCanvas.width, wmCanvas.height);
        const wmData = wmCanvas.toDataURL("image/png");
        doc.addImage(wmData, "PNG", wmX, wmY, wmW, wmH);
      }

      y += ih + 8;
    }
  } catch (e) {
    sf("normal", 8, C_GRAY_500);
    doc.text("(Plano no disponible en esta versión)", pw / 2, y + 10, { align: "center" });
    y += 20;
  }

  sf("normal", 6, C_GRAY_500);
  doc.text(`Plano de referencia: ${planLabels[planSize]}. El plano final será elaborado por el equipo de TOBYCO según el proyecto.`, pw / 2, y, { align: "center", maxWidth: CW });
  y += 10;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — Terms & Conditions
  // ═══════════════════════════════════════════════════════════════════════════
  addPage();

  sf("bold", 13, C_GRAY_900);
  doc.text("TÉRMINOS Y CONDICIONES", pw / 2, y + 5, { align: "center" });
  doc.setFillColor(...C_ACCENT_RULE);
  doc.rect(pw / 2 - 22, y + 7.5, 44, 0.6, "F");
  y += 15;

  const defaultTC = [
    { title: "1. Partes involucradas", content: 'El presente presupuesto es emitido por TOBYCO Constructora (en adelante "LA EMPRESA") con domicilio en la República Argentina, en respuesta a la solicitud del cliente identificado en la sección de datos del presente documento (en adelante "EL CLIENTE").' },
    { title: "2. Validez del presupuesto", content: `Este presupuesto tiene una validez de 30 (treinta) días corridos desde su fecha de emisión (${today}). Transcurrido dicho plazo, los valores deberán ser actualizados por LA EMPRESA conforme a la variación de costos de materiales, mano de obra y tipo de cambio vigente.` },
    { title: "3. Valores y moneda", content: "Todos los valores están expresados en dólares estadounidenses (USD). Los precios NO incluyen impuestos nacionales, provinciales ni municipales (IVA, Ingresos Brutos, tasas municipales). El presupuesto es orientativo y puede variar por condiciones del terreno o especificaciones técnicas." },
    { title: "4. Alcance de la obra", content: "Los trabajos incluidos son únicamente aquellos descritos en las secciones anteriores de este documento. Cualquier modificación, ampliación o trabajo adicional deberá ser acordada por escrito entre las partes y dará lugar a un ajuste del presupuesto original." },
    { title: "5. Forma de pago", content: "Los desembolsos se realizarán por etapas de obra según el cronograma detallado en este documento. Cada certificado de avance deberá ser aprobado por ambas partes antes del pago correspondiente. TOBYCO ofrece opciones de financiación — consultar en www.tobycoconstructora.com.ar." },
    { title: "6. Garantía y responsabilidad", content: "TOBYCO Constructora garantiza la calidad de los trabajos ejecutados conforme a las normas IRAM y el Código de Edificación vigente. Se otorga garantía estructural de 10 años sobre la obra y 1 año sobre instalaciones y terminaciones a partir de la fecha de entrega final." },
    { title: "7. Profesionales habilitados", content: "Todos los trabajos son ejecutados por profesionales matriculados (arquitectos e ingenieros) con experiencia comprobable, cumpliendo la normativa vigente de cada municipio. TOBYCO se hace responsable de tramitar los permisos de obra necesarios." },
    { title: "8. Resolución de conflictos", content: "Ante cualquier diferencia entre las partes, se buscará resolución amistosa. En caso de no llegarse a un acuerdo, se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero." },
  ];

  const sourceTC = termsData.length > 0
    ? [...termsData].sort((a, b) => (a.order || 0) - (b.order || 0))
    : defaultTC;

  for (const section of sourceTC) {
    const lines = (section.content || "").split(/\n+/).filter(Boolean);
    const sectionH = 8 + lines.length * 5;
    ensureSpace(sectionH + 4);

    sf("bold", 7.5, C_ACCENT);
    doc.text(section.title, M, y + 5);
    // Underline title with pastel rule
    doc.setFillColor(...C_ACCENT_RULE);
    doc.rect(M, y + 6.5, 60, 0.3, "F");
    y += 8;
    sf("normal", 6.8, C_GRAY_700);
    lines.forEach(line => {
      doc.text(line, M + 3, y + 4, { maxWidth: CW - 3 });
      y += 5;
    });
    doc.setDrawColor(...C_GRAY_300);
    doc.setLineWidth(0.1);
    doc.line(M, y + 1, pw - M, y + 1);
    y += 5;
  }

  // Disclaimer box — tall enough to fit all lines comfortably
  const disclaimerLines = [
    "* Presupuesto orientativo — puede variar según condiciones del terreno y fluctuación de costos.",
    "* Valores expresados en dólares estadounidenses (USD).",
    "* Los precios NO incluyen impuestos nacionales, provinciales ni municipales.",
    `* Válido hasta el ${validUntil}.`,
    "* Contacto: info@tobyco.com.ar  ·  +54 9 11 4041-9044  ·  www.tobycoconstructora.com.ar",
  ];
  const disclaimerH = 10 + disclaimerLines.length * 5.2;
  ensureSpace(disclaimerH + 8);
  doc.setFillColor(...C_ACCENT_PALE);
  doc.setDrawColor(...C_ACCENT_SOFT);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CW, disclaimerH, 1.5, 1.5, "FD");
  doc.setFillColor(...C_ACCENT);
  doc.rect(M, y, 3, disclaimerH, "F");
  sf("bold", 7, C_GRAY_700);
  doc.text("NOTA IMPORTANTE", M + 8, y + 7);
  sf("normal", 6.5, C_GRAY_700);
  disclaimerLines.forEach((line, i) => {
    doc.text(line, M + 8, y + 13 + i * 5.2, { maxWidth: CW - 14 });
  });
  y += disclaimerH + 6;

  // Signature block
  ensureSpace(36);
  y += 4;
  doc.setFillColor(...C_GRAY_50);
  doc.setDrawColor(...C_GRAY_300);
  doc.setLineWidth(0.2);
  doc.roundedRect(M, y, CW, 28, 1.5, 1.5, "FD");
  sf("bold", 7, C_GRAY_700);
  doc.text("ACEPTACIÓN DEL PRESUPUESTO", M + 5, y + 7);
  sf("normal", 6.5, C_GRAY_500);
  doc.text("Al proceder con la obra, EL CLIENTE declara haber leído, comprendido y aceptado los presentes términos.", M + 5, y + 13, { maxWidth: CW - 10 });

  const signY = y + 20;
  doc.setDrawColor(...C_GRAY_300);
  doc.setLineWidth(0.4);
  doc.line(M + 5, signY, M + 70, signY);
  doc.line(M + CW - 70, signY, M + CW - 5, signY);
  sf("normal", 6, C_GRAY_500);
  doc.text("Firma del Cliente", M + 37, signY + 4, { align: "center" });
  doc.text("TOBYCO Constructora", M + CW - 37, signY + 4, { align: "center" });
  y += 32;

  // Redraw all footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  if (openForPrint) {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.addEventListener("load", () => win.print());
  } else {
    doc.save(`presupuesto-tobyco-${area}m2-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}