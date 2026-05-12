import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CONSTRUCTION_SYSTEMS } from "@/lib/pricingData";
import { formatCurrency } from "@/lib/pricingData";

const STAGE_COLORS = [
  { bg: "bg-orange-600", text: "text-orange-600", light: "bg-orange-100" },
  { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-100" },
  { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-100" },
  { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-100" },
  { bg: "bg-green-600", text: "text-green-600", light: "bg-green-100" },
  { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-100" },
];

const DEFAULT_PCTS = [12, 18, 15, 20, 25, 10];

export default function GanttChart({ system, totalMonths, totalCost }) {
  const systemInfo = CONSTRUCTION_SYSTEMS[system];
  const months = systemInfo?.timeMonths || 8;

  const { data: dbConfigs = [] } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: () => base44.entities.BuildConfig.list("-created_date", 500),
    staleTime: 60_000,
  });

  const getPct = (idx) => {
    const rec = dbConfigs.find(c => c.config_key === `stage_pct_${idx + 1}`);
    return rec?.value ?? DEFAULT_PCTS[idx];
  };

  const STAGE_NAMES = [
    "Fundaciones y excavación",
    "Estructura / Esqueleto",
    "Cerramientos y cubierta",
    "Instalaciones eléctricas/sanitarias",
    "Terminaciones interiores",
    "Exteriores y entrega",
  ];

  const stages = [
    { name: STAGE_NAMES[0], duration: Math.max(1, Math.round(months * 0.15)), start: 0, pct: getPct(0) },
    { name: STAGE_NAMES[1], duration: Math.max(1, Math.round(months * 0.22)), start: Math.max(1, Math.round(months * 0.15)), pct: getPct(1) },
    { name: STAGE_NAMES[2], duration: Math.max(1, Math.round(months * 0.18)), start: Math.max(1, Math.round(months * 0.15)) + Math.max(1, Math.round(months * 0.22)) - 1, pct: getPct(2) },
    { name: STAGE_NAMES[3], duration: Math.max(1, Math.round(months * 0.2)), start: Math.max(1, Math.round(months * 0.35)), pct: getPct(3) },
    { name: STAGE_NAMES[4], duration: Math.max(1, Math.round(months * 0.28)), start: Math.max(1, Math.round(months * 0.5)), pct: getPct(4) },
    { name: STAGE_NAMES[5], duration: Math.max(1, Math.round(months * 0.12)), start: Math.max(1, months - Math.round(months * 0.12)), pct: getPct(5) },
  ];

  const totalCols = months;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <div className="min-w-[600px] p-4">
          {/* Header: month columns */}
          <div className="flex mb-3">
            <div className="w-44 flex-shrink-0 text-xs text-muted-foreground font-medium pr-2">Etapa</div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}>
              {Array.from({ length: totalCols }, (_, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                  M{i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Stage rows */}
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const color = STAGE_COLORS[idx] || STAGE_COLORS[0];
              const stageCost = Math.round(totalCost * stage.pct / 100);
              return (
                <div key={stage.name} className="flex items-center">
                  <div className="w-44 flex-shrink-0 pr-2">
                    <div className="text-xs font-medium leading-tight">{stage.name}</div>
                    <div className={`text-xs font-bold ${color.text}`}>{formatCurrency(stageCost)}</div>
                  </div>
                  <div className="flex-1 relative h-8 grid" style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}>
                    {Array.from({ length: totalCols }, (_, col) => {
                      const isInRange = col >= stage.start && col < stage.start + stage.duration;
                      const isFirst = col === stage.start;
                      const isLast = col === stage.start + stage.duration - 1;
                      return (
                        <div
                          key={col}
                          className={`h-7 ${isInRange ? color.bg : ""} ${isFirst ? "rounded-l-lg" : ""} ${isLast ? "rounded-r-lg" : ""}`}
                        />
                      );
                    })}
                    {/* Label on bar */}
                    {stage.duration > 1 && (
                      <div
                        className="absolute inset-0 flex items-center px-2 pointer-events-none"
                        style={{ left: `${(stage.start / totalCols) * 100}%`, width: `${(stage.duration / totalCols) * 100}%` }}
                      >
                        <span className="text-white text-xs font-medium truncate">{stage.pct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-3">
              {stages.map((stage, idx) => {
                const color = STAGE_COLORS[idx];
                return (
                  <div key={stage.name} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${color.bg}`} />
                    <span className="text-xs text-muted-foreground">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Disbursement schedule */}
      <div className="rounded-xl border bg-card p-4">
        <h4 className="font-semibold text-sm mb-3">Cronograma de desembolsos estimados</h4>
        <div className="overflow-x-auto">
          <div className="min-w-[480px] space-y-2">
            {stages.map((stage, idx) => {
              const color = STAGE_COLORS[idx];
              const stageCost = Math.round(totalCost * stage.pct / 100);
              return (
                <div key={stage.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-shrink-0 w-56">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.bg}`} />
                    <span className="text-xs text-muted-foreground truncate">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(mes {stage.start + 1}–{stage.start + stage.duration})</span>
                    <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${color.bg}`} style={{ width: `${stage.pct}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${color.text} w-20 text-right whitespace-nowrap`}>{formatCurrency(stageCost)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between">
          <span className="text-sm font-semibold">Total obra</span>
          <span className="text-sm font-bold text-primary">{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </div>
  );
}