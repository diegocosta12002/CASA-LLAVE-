// All construction stage options with pricing

export const LOCATION_TYPES = [
  { key: "open", label: "Barrio Abierto", description: "Sin restricciones urbanísticas especiales", costAdd: 0, icon: "MapPin" },
  { key: "gated", label: "Barrio Cerrado", description: "Con normativa propia y expensas", costAdd: 3500, icon: "Shield" },
  { key: "rural", label: "Zona Rural", description: "LOTE RURAL", costAdd: 2000, icon: "TreePine" },
  { key: "urban", label: "Zona Urbana Densa", description: "Centro urbano con accesos restringidos", costAdd: 4000, icon: "Building2" },
];

export const FOUNDATION_TYPES = [
  { key: "strip", label: "Viga de fundación", description: "Zapatas corridas y vigas, la más común", costPerM2: 45, icon: "Minus" },
  { key: "slab", label: "Platea de hormigón", description: "Losa de fundación continua, mayor resistencia", costPerM2: 65, icon: "Square" },
  { key: "piles", label: "Pilotines", description: "Para terrenos con baja capacidad portante", costPerM2: 85, icon: "ArrowDown" },
  { key: "combined", label: "Combinada", description: "Zapatas + vigas de encadenado", costPerM2: 55, icon: "Grid2x2" },
];

export const ROOFING_TYPES = [
  { key: "tiles_ceramic", label: "Tejas cerámicas", description: "Clásicas y elegantes, alta durabilidad", costPerM2: 35, icon: "Home" },
  { key: "metal_sheet", label: "Chapa trapezoidal", description: "Liviana, rápida instalación", costPerM2: 18, icon: "Zap" },
  { key: "flat_concrete", label: "Losa plana aislada", description: "Moderna, permite uso de terraza", costPerM2: 55, icon: "Minus" },
];

export const BATHROOM_CONFIG = [
  { key: "1bath", label: "1 Baño", description: "Ideal para casas compactas hasta 80 m²", bathrooms: 1, toilets: 0, costAdd: 0 },
  { key: "1bath_1toilet", label: "1 Baño + 1 Toilette", description: "Solución práctica para casas medianas", bathrooms: 1, toilets: 1, costAdd: 3200 },
  { key: "2bath", label: "2 Baños completos", description: "Recomendado para casas de 120 m² o más", bathrooms: 2, toilets: 0, costAdd: 5500 },
  { key: "2bath_1toilet", label: "2 Baños + 1 Toilette", description: "Máximo confort para familias grandes", bathrooms: 2, toilets: 1, costAdd: 8000 },
];

export const PLUMBING_TYPES = [
  { key: "basic", label: "Grifería estándar", description: "Funcional y económica, marca nacional", costAdd: 800, icon: "Droplets" },
  { key: "mid", label: "Grifería media", description: "Mejor acabado, marcas importadas económicas", costAdd: 1800, icon: "Droplets" },
  { key: "premium", label: "Grifería premium", description: "Alta gama, diseño europeo", costAdd: 3500, icon: "Droplets" },
];

export const SANITARY_TYPES = [
  { key: "basic", label: "Artefactos básicos", description: "Inodoro, bidet y lavatorio estándar", costPerBathroom: 1200, icon: "Circle" },
  { key: "standard", label: "Artefactos medios", description: "Línea intermedia con mejor diseño", costPerBathroom: 2200, icon: "Circle" },
  { key: "premium", label: "Artefactos premium", description: "Línea premium con ducha de lluvia", costPerBathroom: 4000, icon: "Sparkles" },
  { key: "deluxe", label: "Artefactos Deluxe", description: "Hidromasajes, bañera exenta", costPerBathroom: 7500, icon: "Gem" },
];

export const FLOORING_TYPES = [
  { key: "ceramic", label: "Cerámico", description: "Económico y resistente, múltiples diseños", costPerM2: 22, icon: "Grid2x2" },
  { key: "porcelain_standard", label: "Porcelanato SPL", description: "Mayor resistencia y estética", costPerM2: 38, icon: "Square" },
  { key: "porcelain_large", label: "Porcelanato gran formato", description: "Piezas 60x60 o 80x80, look moderno", costPerM2: 55, icon: "Square" },
  { key: "vinyl", label: "Pisos vinílicos", description: "Calidez, confort y fácil instalación", costPerM2: 35, icon: "Layers" },
  { key: "polished_concrete", label: "Microcemento/Cemento", description: "Tendencia moderna e industrial", costPerM2: 42, icon: "Minus" },
];

export const KITCHEN_COUNTERTOP = [
  { key: "granite", label: "Granito", description: "Clásico, resistente al calor", costAdd: 1200, icon: "Square" },
  { key: "granite_black", label: "Granito Negro Brasil", description: "Elegante, resistente y de gran impacto visual", costAdd: 2000, icon: "Diamond" },
  { key: "quartz", label: "Cuarzo engineered", description: "Sin poros, muy fácil mantenimiento", costAdd: 2200, icon: "Diamond" },
  { key: "porcelain", label: "Porcelanato SPL", description: "Económico y versátil", costAdd: 800, icon: "Square" },
];

export const KITCHEN_CABINETS = [
  { key: "none", label: "Sin muebles", description: "Sin muebles de cocina (cliente define luego)", costAdd: 0, icon: "Minus" },
  { key: "melamine", label: "Melamina", description: "Económico, variedad de colores", costAdd: 2000, icon: "LayoutGrid" },
  { key: "mdf_painted", label: "MDF laqueado", description: "Acabado liso y moderno", costAdd: 3800, icon: "LayoutGrid" },
  { key: "solid_wood", label: "Madera maciza", description: "Durable y cálido, personalizable", costAdd: 6500, icon: "TreePine" },
];

// WALL_CLADDING ahora tiene m2 configurables por opción (en FinishDetailsStep se permite ingresar m2)
export const WALL_CLADDING = [
  { key: "paint", label: "Pintura látex", description: "Clásico, económico y fácil de renovar", costPerM2: 8, icon: "PaintBucket", allowCustomM2: false },
  { key: "porcelain_tile", label: "Porcelanato en pared", description: "Moderno y elegante", costPerM2: 45, icon: "Square", allowCustomM2: true },
  { key: "stone_veneer", label: "Piedra natural", description: "Rústico y de gran impacto visual", costPerM2: 65, icon: "Mountain", allowCustomM2: true },
  { key: "textured_color", label: "Revestimiento texturado color", description: "Moderno, variedad de texturas y colores", costPerM2: 32, icon: "Layers", allowCustomM2: true },
];

export const BATHROOM_CLADDING = [
  { key: "ceramic_bath", label: "Cerámico", description: "Económico y resistente, fácil limpieza", costPerM2: 28, icon: "Grid2x2" },
  { key: "porcelain_spl_bath", label: "Porcelanato SPL", description: "Mayor resistencia y estética superior", costPerM2: 48, icon: "Square" },
  { key: "porcelain_large_bath", label: "Porcelanato gran formato", description: "Piezas grandes, look premium y moderno", costPerM2: 68, icon: "Square" },
  { key: "microcement_bath", label: "Microcemento", description: "Tendencia actual, sin juntas, muy moderno", costPerM2: 75, icon: "Minus" },
];

export const WINDOW_TYPES = [
  { key: "aluminum_single", label: "Aluminio vidrio simple", description: "Económico, bajo mantenimiento", costPerM2: 280, icon: "Square" },
  { key: "aluminum_dvh", label: "Aluminio con DVH", description: "Doble vidriado hermético, mejor aislación", costPerM2: 480, icon: "Layers" },
  { key: "pvc_standard", label: "PVC vidrio simple", description: "Buena aislación, sin mantenimiento", costPerM2: 380, icon: "Shield" },
  { key: "pvc_dvh", label: "PVC con DVH", description: "Máxima eficiencia energética", costPerM2: 580, icon: "Shield" },
  { key: "security_glass", label: "Vidrio de seguridad", description: "Laminado o templado, alta resistencia", costPerM2: 520, icon: "Lock" },
];

export const HEATING_TYPES = [
  { key: "none", label: "Sin calefacción", description: "Sin sistema de calefacción incluido", costAdd: 0, icon: "Minus" },
  { key: "radiators", label: "Calefacción por radiadores", description: "Sistema tradicional de agua caliente, eficiente y confortable", costAdd: 6500, icon: "Thermometer" },
  { key: "electric_floor", label: "Piso eléctrico", description: "Calefacción radiante eléctrica bajo piso, confort total", costAdd: 9000, icon: "Zap" },
  { key: "radiant_floor", label: "Piso radiante", description: "Sistema hidronico bajo piso, máxima eficiencia energética", costAdd: 14000, icon: "Flame" },
];

export const WOODWORK_TYPES = [
  { key: "none", label: "Sin interiores", description: "Sin carpintería de madera interior", costAdd: 0, icon: "Minus" },
  { key: "closets_with_doors", label: "Placares con puertas", description: "Placares interiores con puerta batiente o corrediza", costAdd: 5500, icon: "LayoutGrid" },
  { key: "walkin_no_doors", label: "Vestidor sin puertas", description: "Walk-in closet abierto, sin puertas", costAdd: 3200, icon: "LayoutGrid" },
];

export const ELECTRICAL_TYPES = [
  { key: "standard_elec", label: "Instalación estándar", description: "Bocas de luz y tomacorrientes según código, tablero monofásico", costAdd: 4500, icon: "Zap" },
  { key: "premium_elec", label: "Instalación premium", description: "Mayor cantidad de circuitos, tablero trifásico, puntos extra", costAdd: 8000, icon: "Sparkles" },
  { key: "smart_home", label: "Smart Home", description: "Preparación completa para domótica y automatización: cableado estructurado, hub central, control por app", costAdd: 18000, icon: "Wifi" },
];

export const FLOOR_TYPES = [
  { key: "single", label: "Planta baja (1 planta)", description: "Toda la vivienda en un solo nivel", costPct: 0 },
  { key: "double", label: "Planta baja + Primer piso", description: "Vivienda de dos plantas", costPct: 8 },
];

export const EXTRAS = [
  { key: "bbq", label: "Parrilla", description: "Asador con chimenea y mesada exterior", costAdd: 4500, icon: "Flame" },
  { key: "pergola", label: "Pérgola / Guardacoches", description: "Cochera techada adosada a la vivienda", costAdd: 7000, icon: "Car" },
  { key: "pool_standard", label: "Piscina estándar (5×3 m)", description: "Pileta de natación estándar hormigonada", costAdd: 22000, icon: "Waves" },
  { key: "pool_large", label: "Piscina grande (8×4 m)", description: "Pileta de natación ampliada con escalera romana", costAdd: 38000, icon: "Waves" },
  { key: "biodigester", label: "Bio-digestor", description: "Sistema de tratamiento ecológico de efluentes cloacales", costAdd: 3800, icon: "Leaf" },
  { key: "ac_preinstall", label: "Pre-instalación AC (todos los ambientes)", description: "Cañerías, desagüe y puntos eléctricos para aire acondicionado en cada ambiente", costAdd: 5200, icon: "Wind" },
  { key: "solar", label: "Energía solar", description: "Paneles solares fotovoltaicos básicos", costAdd: 8500, icon: "Sun" },
  { key: "garden", label: "Jardín diseñado", description: "Parquización y riego automático", costAdd: 3200, icon: "Leaf" },
];

// Construction stages for Gantt chart
export function getConstructionStages(systemKey, totalMonths) {
  const isModular = systemKey === "mixed" || systemKey === "obra_gris_mixed";
  const isObraGris = systemKey?.startsWith("obra_gris");

  if (isObraGris) {
    // Obra gris: no terminaciones, solo estructura e instalaciones
    return [
      { name: "Fundaciones", months: 1, start: 0, color: "#c2410c", percentage: 15 },
      { name: "Estructura", months: isModular ? 2 : 2, start: 1, color: "#b45309", percentage: 30 },
      { name: "Cerramientos", months: 1.5, start: isModular ? 3 : 3, color: "#d97706", percentage: 25 },
      { name: "Instalaciones básicas", months: 1.5, start: isModular ? 4.5 : 4.5, color: "#0369a1", percentage: 30 },
    ];
  }

  const stages = [
    { name: "Fundaciones", months: isModular ? 1 : 1.5, start: 0, color: "#c2410c", percentage: 12 },
    { name: "Estructura", months: isModular ? 1.5 : 2, start: isModular ? 1 : 1.5, color: "#b45309", percentage: 18 },
    { name: "Cerramientos", months: 1.5, start: isModular ? 2.5 : 3, color: "#d97706", percentage: 15 },
    { name: "Instalaciones", months: 1.5, start: isModular ? 4 : 4, color: "#0369a1", percentage: 20 },
    { name: "Terminaciones", months: 2.5, start: isModular ? 5.5 : 5, color: "#15803d", percentage: 25 },
    { name: "Exteriores", months: 1, start: isModular ? 8 : 7, color: "#7e22ce", percentage: 10 },
  ];

  return stages;
}

// Helper: get DB-overridden value for an option, fallback to static
function dbVal(dbConfigs, configKey, fallback) {
  if (!dbConfigs || dbConfigs.length === 0) return fallback;
  const rec = dbConfigs.find(r => r.config_key === configKey);
  return rec?.value ?? fallback;
}

export function calculateStagesCost(selections, area, systemKey, bathConfig, dbConfigs = []) {
  let total = 0;
  const items = {};

  const numBathrooms = (bathConfig?.bathrooms || 1) + (bathConfig?.toilets || 0);

  if (selections.location) {
    const loc = LOCATION_TYPES.find(x => x.key === selections.location);
    if (loc) {
      const v = dbVal(dbConfigs, `location_${loc.key}`, loc.costAdd);
      total += v; items.location = v;
    }
  }
  if (selections.foundation) {
    const f = FOUNDATION_TYPES.find(x => x.key === selections.foundation);
    if (f) {
      const v = dbVal(dbConfigs, `foundation_${f.key}`, f.costPerM2) * area;
      total += v; items.foundation = v;
    }
  }
  if (selections.roofing) {
    const r = ROOFING_TYPES.find(x => x.key === selections.roofing);
    if (r) {
      const v = dbVal(dbConfigs, `roofing_${r.key}`, r.costPerM2) * area;
      total += v; items.roofing = v;
    }
  }
  if (selections.bathroom) {
    const b = BATHROOM_CONFIG.find(x => x.key === selections.bathroom);
    if (b) {
      const v = dbVal(dbConfigs, `bathroom_${b.key}`, b.costAdd);
      total += v; items.bathroom = v;
    }
  }
  if (selections.plumbing) {
    const p = PLUMBING_TYPES.find(x => x.key === selections.plumbing);
    if (p) {
      const v = dbVal(dbConfigs, `plumbing_${p.key}`, p.costAdd);
      total += v; items.plumbing = v;
    }
  }
  if (selections.sanitary) {
    const s = SANITARY_TYPES.find(x => x.key === selections.sanitary);
    if (s) {
      const v = dbVal(dbConfigs, `sanitary_${s.key}`, s.costPerBathroom) * numBathrooms;
      total += v; items.sanitary = v;
    }
  }
  if (selections.flooring) {
    const fl = FLOORING_TYPES.find(x => x.key === selections.flooring);
    if (fl) {
      const v = dbVal(dbConfigs, `flooring_${fl.key}`, fl.costPerM2) * area;
      total += v; items.flooring = v;
    }
  }
  if (selections.countertop) {
    const ct = KITCHEN_COUNTERTOP.find(x => x.key === selections.countertop);
    if (ct) {
      const v = dbVal(dbConfigs, `countertop_${ct.key}`, ct.costAdd);
      total += v; items.countertop = v;
    }
  }
  if (selections.cabinets) {
    const cab = KITCHEN_CABINETS.find(x => x.key === selections.cabinets);
    if (cab) {
      const v = dbVal(dbConfigs, `cabinets_${cab.key}`, cab.costAdd);
      total += v; items.cabinets = v;
    }
  }
  if (selections.wallCladding) {
    const wc = WALL_CLADDING.find(x => x.key === selections.wallCladding);
    if (wc) {
      const m2 = wc.allowCustomM2 && selections.wallCladdingM2 ? selections.wallCladdingM2 : area * 0.4;
      const rate = dbVal(dbConfigs, `wall_cladding_${wc.key}`, wc.costPerM2);
      const v = rate * m2;
      total += v; items.wallCladding = v;
    }
  }
  if (selections.bathroomCladding) {
    const bc = BATHROOM_CLADDING.find(x => x.key === selections.bathroomCladding);
    if (bc) {
      const bathM2 = numBathrooms * 12;
      const rate = dbVal(dbConfigs, `bath_cladding_${bc.key}`, bc.costPerM2);
      const v = rate * bathM2;
      total += v; items.bathroomCladding = v;
    }
  }
  if (selections.windows) {
    const win = WINDOW_TYPES.find(x => x.key === selections.windows);
    if (win) {
      const rate = dbVal(dbConfigs, `windows_${win.key}`, win.costPerM2);
      const v = rate * (area * 0.15);
      total += v; items.windows = v;
    }
  }
  if (selections.heating) {
    const ht = HEATING_TYPES.find(x => x.key === selections.heating);
    if (ht) {
      const v = dbVal(dbConfigs, `heating_${ht.key}`, ht.costAdd);
      total += v; items.heating = v;
    }
  }
  if (selections.electrical) {
    const el = ELECTRICAL_TYPES.find(x => x.key === selections.electrical);
    if (el) {
      const v = dbVal(dbConfigs, `electrical_${el.key}`, el.costAdd);
      total += v; items.electrical = v;
    }
  }
  if (selections.woodwork) {
    const ww = WOODWORK_TYPES.find(x => x.key === selections.woodwork);
    if (ww) {
      const v = dbVal(dbConfigs, `woodwork_${ww.key}`, ww.costAdd);
      total += v; items.woodwork = v;
    }
  }
  if (selections.extras) {
    let extraTotal = 0;
    selections.extras.forEach(key => {
      const ex = EXTRAS.find(x => x.key === key);
      if (ex) {
        const v = dbVal(dbConfigs, `extra_${ex.key}`, ex.costAdd);
        extraTotal += v;
      }
    });
    total += extraTotal;
    items.extras = extraTotal;
  }

  return { total: Math.round(total), items };
}