// Default pricing data - used as fallback; admin can override via BuildConfig entity

export const PREDEFINED_SIZES = [
  { label: "Compacta", m2: 80, description: "Ideal para parejas o personas solas" },
  { label: "Familiar", m2: 120, description: "Perfecta para familias medianas" },
  { label: "Premium", m2: 180, description: "Espaciosa para familias grandes" },
];

// 3 sistemas constructivos (llave en mano)
export const CONSTRUCTION_SYSTEMS = {
  traditional: {
    key: "traditional",
    label: "Tradicional",
    subtitle: "Ladrillo hueco",
    costPerM2: 1200,
    description: "Sistema clásico de construcción con mampostería.",
    advantages: ["Alta durabilidad", "Excelente aislamiento térmico", "Gran flexibilidad de diseño", "Alta resistencia al fuego"],
    disadvantages: ["Mayor tiempo de construcción", "Costo de mano de obra elevado", "Mayor generación de residuos"],
    timeMonths: 10,
    icon: "Brick",
  },
  steel_frame: {
    key: "steel_frame",
    label: "Steel Framing",
    subtitle: "Estructura de acero",
    costPerM2: 1190,
    description: "Sistema constructivo en seco con perfiles de acero galvanizado liviano.",
    advantages: ["Construcción rápida", "Menor peso estructural", "Buen aislamiento con paneles", "Menos residuos"],
    disadvantages: ["Requiere mano de obra especializada", "Menor inercia térmica", "Costos de materiales variables"],
    timeMonths: 6,
    icon: "Container",
  },
  mixed: {
    key: "mixed",
    label: "Sistema Mixto",
    subtitle: "Tradicional + Steel Framing",
    costPerM2: 1350,
    description: "Sistema de mampostería tradicional con hormigón y estructura interior de Steel Framing, permitiendo grandes aventanamientos.",
    advantages: ["Grandes aberturas de vidrio", "Excelente aislación", "Diseño contemporáneo", "Combinación óptima de materiales"],
    disadvantages: ["Mayor complejidad de ejecución", "Requiere dos tipos de mano de obra", "Coordinación más exigente"],
    timeMonths: 9,
    icon: "LayoutGrid",
  },
};

// 3 variantes de Obra Gris (modalidad económica por etapas)
export const OBRA_GRIS_SYSTEMS = {
  obra_gris_traditional: {
    key: "obra_gris_traditional",
    label: "Obra Gris Tradicional",
    subtitle: "Ladrillo hueco · Solo estructura",
    costPerM2: 890,
    description: "Estructura tradicional en ladrillo hueco: fundación, paredes, revoques grueso/fino, cañerías y cubierta. Sin terminaciones.",
    advantages: ["Menor inversión inicial", "Estructura clásica y robusta", "Permite terminar en etapas", "Flexibilidad de diseño interior"],
    disadvantages: ["No incluye terminaciones", "Requiere inversión adicional para habitar", "Mayor tiempo de finalización total"],
    timeMonths: 6,
    icon: "Brick",
    isShell: true,
    baseSystem: "traditional",
  },
  obra_gris_steel: {
    key: "obra_gris_steel",
    label: "Obra Gris Steel Framing",
    subtitle: "Estructura de acero · Solo estructura",
    costPerM2: 870,
    description: "Estructura en seco de acero galvanizado: perfiles, placas de yeso-cartón, cañerías y cubierta. Sin terminaciones ni revestimientos.",
    advantages: ["Construcción muy rápida", "Menor inversión inicial", "Liviano y eficiente", "Fácil de ampliar y modificar"],
    disadvantages: ["No incluye terminaciones", "Requiere mano de obra especializada", "Sin carpintería ni revestimientos"],
    timeMonths: 5,
    icon: "Container",
    isShell: true,
    baseSystem: "steel_frame",
  },
  obra_gris_mixed: {
    key: "obra_gris_mixed",
    label: "Obra Gris Sistema Mixto",
    subtitle: "Tradicional + Steel Framing · Solo estructura",
    costPerM2: 950,
    description: "Estructura combinada: mampostería tradicional con Steel Framing en zonas clave. Fundación, estructura, cañerías y cubierta. Sin terminaciones.",
    advantages: ["Lo mejor de ambas estructuras", "Grandes aventanamientos posibles", "Inversión optimizada", "Alta flexibilidad futura"],
    disadvantages: ["Mayor complejidad estructural", "Dos tipos de mano de obra", "Sin terminaciones ni carpintería"],
    timeMonths: 7,
    icon: "LayoutGrid",
    isShell: true,
    baseSystem: "mixed",
  },
};

// Unión de todos para funciones genéricas de cálculo
export const ALL_SYSTEMS = { ...CONSTRUCTION_SYSTEMS, ...OBRA_GRIS_SYSTEMS };

export const FINISH_TIERS = {
  basic: {
    key: "basic",
    label: "Básico",
    multiplier: 1.0,
    description: "Acabados funcionales y económicos. Materiales estándar de buena calidad.",
    priceAdd: 0,
  },
  standard: {
    key: "standard",
    label: "Estándar",
    multiplier: 1.25,
    description: "Acabados de calidad media-alta. Mejor estética y materiales duraderos.",
    priceAdd: 120,
  },
  premium: {
    key: "premium",
    label: "Premium",
    multiplier: 1.55,
    description: "Acabados de lujo con materiales de primera categoría.",
    priceAdd: 280,
  },
};

export const FINISH_DETAILS = {
  flooring: {
    label: "Pisos",
    options: [
      { key: "ceramic", label: "Cerámico", costPerM2: 25, icon: "Grid3x3" },
      { key: "porcelain", label: "Porcelanato SPL", costPerM2: 45, icon: "Square" },
      { key: "wood", label: "Madera", costPerM2: 65, icon: "TreePine" },
      { key: "polished_concrete", label: "Hormigón pulido", costPerM2: 35, icon: "Circle" },
    ],
  },
  kitchen: {
    label: "Cocina",
    options: [
      { key: "basic", label: "Básica", costPerM2: 15, icon: "CookingPot" },
      { key: "modern", label: "Moderna", costPerM2: 35, icon: "ChefHat" },
      { key: "luxury", label: "De lujo", costPerM2: 60, icon: "Sparkles" },
    ],
  },
  bathrooms: {
    label: "Baños",
    options: [
      { key: "standard", label: "Estándar", costPerM2: 20, icon: "Droplets" },
      { key: "premium", label: "Premium", costPerM2: 45, icon: "Gem" },
    ],
  },
  windows: {
    label: "Ventanas",
    options: [
      { key: "aluminum", label: "Aluminio", costPerM2: 10, icon: "Square" },
      { key: "double_glazing", label: "Doble vidrio", costPerM2: 25, icon: "Layers" },
      { key: "pvc", label: "PVC", costPerM2: 30, icon: "Shield" },
    ],
  },
  roofing: {
    label: "Techo",
    options: [
      { key: "tiles", label: "Tejas", costPerM2: 20, icon: "Home" },
      { key: "metal", label: "Chapa", costPerM2: 12, icon: "Zap" },
      { key: "flat", label: "Losa plana", costPerM2: 30, icon: "Minus" },
    ],
  },
  exterior: {
    label: "Exterior",
    options: [
      { key: "plaster", label: "Revoque fino", costPerM2: 8, icon: "PaintBucket" },
      { key: "stone", label: "Piedra", costPerM2: 35, icon: "Mountain" },
      { key: "wood_cladding", label: "Revestimiento madera", costPerM2: 28, icon: "TreePine" },
    ],
  },
};

export function getEstimatedMonths(systemKey, area, dbConfigs = []) {
  // Try DB first
  const dbRecord = dbConfigs.find(c => c.config_key === `system_${systemKey}`);
  const timeMonths = dbRecord?.metadata?.timeMonths ?? ALL_SYSTEMS[systemKey]?.timeMonths ?? 0;
  let base = timeMonths;
  if (area >= 150 && area <= 180) base = 12;
  else if (area > 180) base = 12 + Math.ceil((area - 180) / 20);
  return base;
}

export function getSystemCostPerM2(systemKey, dbConfigs = []) {
  const dbRecord = dbConfigs.find(c => c.config_key === `system_${systemKey}`);
  return dbRecord?.value ?? ALL_SYSTEMS[systemKey]?.costPerM2 ?? 0;
}

export function calculateFloorsCost(area, systemKey, floorsKey, dbConfigs = []) {
  if (!floorsKey || floorsKey === "single") return 0;
  const costPerM2 = getSystemCostPerM2(systemKey, dbConfigs);
  const pctRec = dbConfigs.find(c => c.config_key === "floors_double_pct");
  const pct = (pctRec?.value ?? 8) / 100;
  return Math.round(area * costPerM2 * pct);
}

export function calculateTotal(area, systemKey, finishMode, finishTier, finishDetails, dbConfigs = [], floorsKey = "single") {
  const system = ALL_SYSTEMS[systemKey];
  if (!system) return { total: 0, breakdown: {} };

  const costPerM2 = getSystemCostPerM2(systemKey, dbConfigs);
  const structureCost = area * costPerM2;

  let finishCost = 0;
  if (finishMode === "simple") {
    const tier = FINISH_TIERS[finishTier];
    finishCost = structureCost * (tier.multiplier - 1) + area * tier.priceAdd;
  } else {
    Object.entries(finishDetails || {}).forEach(([category, selectedKey]) => {
      const cat = FINISH_DETAILS[category];
      if (cat) {
        const opt = cat.options.find(o => o.key === selectedKey);
        if (opt) finishCost += area * opt.costPerM2;
      }
    });
  }

  const floorsCost = calculateFloorsCost(area, systemKey, floorsKey, dbConfigs);
  const subtotal = structureCost + finishCost + floorsCost;
  const extrasRec = dbConfigs.find(c => c.config_key === "base_extras_pct");
  const extrasPct = (extrasRec?.value ?? 8) / 100;
  const extras = subtotal * extrasPct;
  const total = subtotal + extras;

  return {
    total: Math.round(total),
    breakdown: {
      structure: Math.round(structureCost),
      finishes: Math.round(finishCost),
      floors: Math.round(floorsCost),
      extras: Math.round(extras),
    },
    costPerM2: Math.round(total / area),
    estimatedMonths: getEstimatedMonths(systemKey, area, dbConfigs),
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}