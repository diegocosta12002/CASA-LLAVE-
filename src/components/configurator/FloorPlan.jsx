// Floor plan PDFs uploaded by the client
const FLOOR_PLANS = {
  80:  "https://media.base44.com/files/public/69c56c4515a812726693b5c3/acdb351e8_OBRA80m2-Model.pdf",
  120: "https://media.base44.com/files/public/69c56c4515a812726693b5c3/7856b483b_casamodelo120m2PDE.pdf",
  180: "https://media.base44.com/files/public/69c56c4515a812726693b5c3/3a7cfd7f5_casamodelo2PDE180M2.pdf",
};

const PLAN_LABELS = {
  80:  "Casa Compacta — 80 m²",
  120: "Casa Familiar — 120 m²",
  180: "Casa Premium — 180 m²",
};

/**
 * Returns the closest plan size (80, 120, or 180) for a given area.
 * Breakpoints: < 100 → 80, 100–149 → 120, ≥ 150 → 180
 */
function getPlanSize(area) {
  if (area < 100) return 80;
  if (area < 150) return 120;
  return 180;
}

export default function FloorPlan({ area }) {
  const planSize = getPlanSize(area);
  const pdfUrl   = FLOOR_PLANS[planSize];
  const label    = PLAN_LABELS[planSize];

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between bg-secondary/30">
        <div>
          <div className="font-medium text-xs">Plano de planta</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-primary underline hover:opacity-80"
        >
          Ver PDF
        </a>
      </div>

      {/* PDF embedded via iframe with watermark overlay */}
      <div className="w-full bg-secondary/10 relative" style={{ height: 420 }}>
        <iframe
          key={planSize}
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-0"
          title={label}
        />
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src="https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg"
            alt="TOBYCO"
            className="w-40 object-contain opacity-20"
          />
        </div>
      </div>

      <div className="px-3 py-1.5 border-t text-[10px] text-muted-foreground text-center">
        Plano orientativo — puede variar según el proyecto final
      </div>
    </div>
  );
}