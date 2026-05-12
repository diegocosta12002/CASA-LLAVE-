import { useState } from "react";
import { motion } from "framer-motion";
import { CONSTRUCTION_SYSTEMS, formatCurrency, getEstimatedMonths } from "@/lib/pricingData";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Check, X, Clock, DollarSign, Zap, Wrench } from "lucide-react";

const AREA = 120; // reference area for price comparison

const SYSTEM_DETAILS = {
  traditional: {
    efficiency: 3,
    ecoScore: 2,
    materials: ["Ladrillo hueco", "Hormigón armado", "Hierro", "Arena y cemento", "Revoque fino/grueso"],
    bestFor: "Quienes buscan durabilidad máxima y flexibilidad de diseño a largo plazo.",
    color: "bg-amber-500",
    colorLight: "bg-amber-50 border-amber-200",
    colorText: "text-amber-700",
  },
  steel_frame: {
    efficiency: 5,
    ecoScore: 5,
    materials: ["Perfiles de acero galvanizado", "Placas de yeso", "Lana de vidrio", "OSB / fibrocemento", "Membrana hidrófuga"],
    bestFor: "Quienes priorizan velocidad de obra, ahorro energético y menor impacto ambiental.",
    color: "bg-blue-500",
    colorLight: "bg-blue-50 border-blue-200",
    colorText: "text-blue-700",
  },
  mixed: {
    efficiency: 4,
    ecoScore: 4,
    materials: ["Mampostería + acero galvanizado", "Hormigón armado", "Grandes vidrios", "OSB + ladrillo", "Doble aislación"],
    bestFor: "Proyectos contemporáneos con grandes ventanales y máxima eficiencia energética.",
    color: "bg-emerald-500",
    colorLight: "bg-emerald-50 border-emerald-200",
    colorText: "text-emerald-700",
  },
};

function ScoreDots({ score, max = 5, color }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors ${
            i < score ? color : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

const SYSTEM_COLORS = {
  traditional: { pill: "bg-amber-100 border-amber-400 text-amber-800", header: "bg-amber-50 border-amber-200", headerText: "text-amber-700", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  steel_frame:  { pill: "bg-blue-100 border-blue-400 text-blue-800",   header: "bg-blue-50 border-blue-200",   headerText: "text-blue-700",   dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700"   },
  mixed:        { pill: "bg-emerald-100 border-emerald-400 text-emerald-800", header: "bg-emerald-50 border-emerald-200", headerText: "text-emerald-700", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
};

export default function SystemComparator() {
  const systemKeys = Object.keys(CONSTRUCTION_SYSTEMS);
  const [left, setLeft] = useState("traditional");
  const [right, setRight] = useState("steel_frame");

  const { data: comparatorConfigs = [] } = useQuery({
    queryKey: ["comparator_configs"],
    queryFn: () => base44.entities.BuildConfig.filter({ category: "comparator_system" }),
    staleTime: 60_000,
  });

  const sysL = CONSTRUCTION_SYSTEMS[left];
  const sysR = CONSTRUCTION_SYSTEMS[right];
  const detL = SYSTEM_DETAILS[left];
  const detR = SYSTEM_DETAILS[right];
  const colL = SYSTEM_COLORS[left] ?? SYSTEM_COLORS.traditional;
  const colR = SYSTEM_COLORS[right] ?? SYSTEM_COLORS.steel_frame;

  const getComparatorCostPerM2 = (key) => {
    const rec = comparatorConfigs.find(c => c.config_key === `comparator_system_${key}`);
    return rec?.value ?? CONSTRUCTION_SYSTEMS[key]?.costPerM2 ?? 0;
  };

  const costPerM2L = getComparatorCostPerM2(left);
  const costPerM2R = getComparatorCostPerM2(right);
  const priceL = Math.round(AREA * costPerM2L);
  const priceR = Math.round(AREA * costPerM2R);
  const monthsL = getEstimatedMonths(left, AREA);
  const monthsR = getEstimatedMonths(right, AREA);

  const rows = [
    {
      label: "Costo estimado 120m²",
      icon: DollarSign,
      left: formatCurrency(priceL),
      right: formatCurrency(priceR),
      winner: priceL < priceR ? "left" : priceR < priceL ? "right" : null,
      winnerLabel: "Más económico",
    },
    {
      label: "Costo por m²",
      icon: DollarSign,
      left: `${formatCurrency(costPerM2L)}/m²`,
      right: `${formatCurrency(costPerM2R)}/m²`,
      winner: costPerM2L < costPerM2R ? "left" : costPerM2R < costPerM2L ? "right" : null,
      winnerLabel: "Más barato/m²",
    },
    {
      label: "Tiempo de obra",
      icon: Clock,
      left: `~${monthsL} meses`,
      right: `~${monthsR} meses`,
      winner: monthsL < monthsR ? "left" : monthsR < monthsL ? "right" : null,
      winnerLabel: "Más rápido",
    },
    {
      label: "Eficiencia constructiva",
      icon: Zap,
      leftNode: <ScoreDots score={detL.efficiency} color={detL.color.replace("bg-", "bg-")} />,
      rightNode: <ScoreDots score={detR.efficiency} color={detR.color.replace("bg-", "bg-")} />,
      left: "",
      right: "",
      winner: detL.efficiency > detR.efficiency ? "left" : detR.efficiency > detL.efficiency ? "right" : null,
      winnerLabel: "Más eficiente",
    },
    {
      label: "Eco-sustentabilidad",
      icon: null,
      leftNode: <ScoreDots score={detL.ecoScore} color="bg-green-500" />,
      rightNode: <ScoreDots score={detR.ecoScore} color="bg-green-500" />,
      left: "",
      right: "",
      winner: detL.ecoScore > detR.ecoScore ? "left" : detR.ecoScore > detL.ecoScore ? "right" : null,
      winnerLabel: "Más sustentable",
    },
    {
      label: "Incluye terminaciones",
      icon: Wrench,
      leftNode: sysL.isShell ? <X className="w-5 h-5 text-destructive" /> : <Check className="w-5 h-5 text-accent" />,
      rightNode: sysR.isShell ? <X className="w-5 h-5 text-destructive" /> : <Check className="w-5 h-5 text-accent" />,
      left: "",
      right: "",
      winner: null,
    },
  ];

  return (
    <section id="comparar" className="px-6 py-16 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold">Comparador de sistemas</h2>
          <p className="text-muted-foreground mt-2">Seleccioná dos sistemas para ver sus diferencias lado a lado</p>
        </div>

        {/* Selectors */}
        <div className="mb-8 space-y-4">
          <p className="text-center text-sm text-muted-foreground">Seleccioná un sistema de cada columna para comparar</p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { val: left, set: setLeft, exclude: right, label: "Sistema A", col: colL },
              { val: right, set: setRight, exclude: left, label: "Sistema B", col: colR },
            ].map(({ val, set, exclude, label, col }, idx) => (
              <div key={idx} className="space-y-2">
                <div className={`text-xs font-bold uppercase tracking-widest text-center px-3 py-1 rounded-full border-2 w-fit mx-auto ${col.pill}`}>
                  {label}
                </div>
                <div className="flex flex-col gap-2">
                  {systemKeys.map((key) => {
                    const sys = CONSTRUCTION_SYSTEMS[key];
                    const c = SYSTEM_COLORS[key] ?? SYSTEM_COLORS.traditional;
                    const isSelected = val === key;
                    const isExcluded = exclude === key;
                    return (
                      <button
                        key={key}
                        onClick={() => !isExcluded && set(key)}
                        disabled={isExcluded}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `${c.header} border-current font-semibold shadow-md`
                            : isExcluded
                            ? "border-border bg-muted/30 opacity-40 cursor-not-allowed"
                            : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />}
                          <div>
                            <div className={`font-semibold text-sm ${isSelected ? c.headerText : ""}`}>{sys.label}</div>
                            <div className="text-xs text-muted-foreground">{sys.subtitle}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <motion.div
          key={`${left}-${right}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-2xl overflow-hidden shadow-md"
        >
          {/* Header */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-4 bg-muted/30 flex items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Característica</span>
            </div>
            {[{ sys: sysL, col: colL }, { sys: sysR, col: colR }].map(({ sys, col }, i) => (
              <div key={i} className={`p-4 text-center border-l ${col.header}`}>
                <div className={`text-sm font-bold ${col.headerText}`}>{sys.label}</div>
                <div className="text-xs text-muted-foreground">{sys.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.label} className={`grid grid-cols-3 border-b last:border-b-0 ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
              <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                {row.icon && <row.icon className="w-4 h-4 flex-shrink-0" />}
                <span>{row.label}</span>
              </div>
              {["left", "right"].map((side) => {
                const isWinner = row.winner === side;
                return (
                  <div key={side} className="p-4 border-l flex flex-col items-center justify-center gap-1">
                    {row[`${side}Node`] ? (
                      row[`${side}Node`]
                    ) : (
                      <span className={`font-semibold text-sm ${isWinner ? "text-accent" : "text-foreground"}`}>
                        {row[side]}
                      </span>
                    )}
                    {isWinner && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${side === "left" ? colL.badge : colR.badge}`}>
                        {row.winnerLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Materials row */}
          <div className="grid grid-cols-3 border-t bg-muted/10">
            <div className="p-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Wrench className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Materiales principales</span>
            </div>
            {[{ det: detL, col: colL }, { det: detR, col: colR }].map(({ det, col }, i) => (
              <div key={i} className="p-4 border-l">
                <ul className="space-y-1">
                  {det.materials.map((m) => (
                    <li key={m} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${col.dot}`} />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Best for row */}
          <div className="grid grid-cols-3 border-t">
            <div className="p-4 flex items-start gap-2 text-sm text-muted-foreground font-medium">
              <span>Ideal para</span>
            </div>
            {[{ det: detL, col: colL }, { det: detR, col: colR }].map(({ det, col }, i) => (
              <div key={i} className={`p-4 border-l ${col.header}`}>
                <p className={`text-xs ${col.headerText} leading-relaxed`}>{det.bestFor}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          * Precios estimados para 120 m² (costo por m² × superficie). No incluye permisos, conexiones ni terminaciones opcionales.
        </p>
      </div>
    </section>
  );
}