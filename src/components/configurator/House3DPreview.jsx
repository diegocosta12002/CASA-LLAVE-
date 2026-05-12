import { useState, useMemo } from "react";
import { CONSTRUCTION_SYSTEMS } from "@/lib/pricingData";
import { Badge } from "@/components/ui/badge";

// Real house images per construction system (Unsplash)
const SYSTEM_IMAGES = {
  traditional: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  steel_frame:  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  obra_gris:    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  mixed:        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
};

// Roof overlay tints
const ROOF_TINTS = {
  flat_concrete: "rgba(150,150,150,0.18)",
  metal_sheet:   "rgba(60,80,100,0.15)",
  tiles_ceramic: "rgba(140,70,20,0.15)",
};

const EXTRA_LABELS = {
  pool_standard: "🏊 Pileta",
  pool_large:    "🏊 Pileta grande",
  pergola:       "🌿 Pérgola",
  solar_panels:  "☀️ Solar",
  garage:        "🚗 Garaje",
  carport:       "🚗 Cochera",
  bbq:           "🔥 Parrilla",
};

export default function House3DPreview({ area, system, stageSelections }) {
  const [imgError, setImgError] = useState(false);

  const systemInfo = CONSTRUCTION_SYSTEMS[system];
  const sel = stageSelections || {};
  const extras = sel.extras || [];
  const imgSrc = SYSTEM_IMAGES[system] || SYSTEM_IMAGES.traditional;
  const roofTint = ROOF_TINTS[sel.roofing] || "transparent";

  const roofLabel = {
    flat_concrete: "Losa plana",
    metal_sheet:   "Chapa trapezoidal",
    tiles_ceramic: "Tejas cerámicas",
  }[sel.roofing] || "";

  const activeExtras = extras.filter(k => EXTRA_LABELS[k]);

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between bg-secondary/20">
        <div>
          <div className="font-medium text-xs">Vista referencial</div>
          <div className="text-[11px] text-muted-foreground">
            {area} m² · {systemInfo?.label}{roofLabel ? ` · ${roofLabel}` : ""}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground italic hidden sm:block">Imagen ilustrativa</div>
      </div>

      {/* Image container */}
      <div className="relative w-full overflow-hidden" style={{ height: 240 }}>
        {/* Sky gradient background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to bottom, #87CEEB 0%, #b0d8f0 40%, #d4eaf7 65%, #e8f4e8 100%)",
          }}
        />

        {/* Neighborhood / landscape layer */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[1]"
          style={{
            height: "45%",
            background: "linear-gradient(to bottom, #c8dfc8 0%, #a8cc99 60%, #8ab87a 100%)",
            borderRadius: "0",
          }}
        />

        {/* Trees silhouette left */}
        <svg
          className="absolute bottom-[38%] left-0 z-[2] opacity-70"
          width="90" height="80" viewBox="0 0 90 80"
          style={{ transform: "translateY(10px)" }}
        >
          <ellipse cx="22" cy="45" rx="18" ry="35" fill="#5a8a50" />
          <rect x="18" y="72" width="8" height="12" fill="#7a5c3a" />
          <ellipse cx="58" cy="50" rx="14" ry="28" fill="#4a7a42" />
          <rect x="55" y="72" width="6" height="10" fill="#7a5c3a" />
          <ellipse cx="80" cy="47" rx="10" ry="22" fill="#6a9a60" />
        </svg>

        {/* Trees silhouette right */}
        <svg
          className="absolute bottom-[38%] right-0 z-[2] opacity-70"
          width="80" height="70" viewBox="0 0 80 70"
          style={{ transform: "translateY(10px)" }}
        >
          <ellipse cx="20" cy="40" rx="16" ry="30" fill="#4a7a42" />
          <rect x="16" y="65" width="7" height="10" fill="#7a5c3a" />
          <ellipse cx="52" cy="44" rx="20" ry="38" fill="#5a8a50" />
          <rect x="47" y="65" width="9" height="12" fill="#7a5c3a" />
        </svg>

        {/* Gated community fence/wall hint */}
        <div
          className="absolute bottom-[38%] left-0 right-0 z-[3]"
          style={{
            height: "5px",
            background: "repeating-linear-gradient(90deg, #c8b89a 0px, #c8b89a 12px, #e8d8c0 12px, #e8d8c0 14px)",
            opacity: 0.8,
          }}
        />

        {/* Driveway */}
        <div
          className="absolute bottom-0 left-1/2 z-[3]"
          style={{
            width: "22%",
            height: "42%",
            transform: "translateX(-50%)",
            background: "linear-gradient(to bottom, #c0b090 0%, #a89878 100%)",
            clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* House image */}
        {!imgError ? (
          <img
            src={imgSrc}
            alt={`Casa ${systemInfo?.label}`}
            className="absolute inset-0 w-full h-full object-cover z-[4]"
            style={{
              objectPosition: "center 60%",
              mixBlendMode: "multiply",
              opacity: 0.92,
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 z-[4] flex items-center justify-center text-muted-foreground text-xs">
            Vista no disponible
          </div>
        )}

        {/* Roof color tint overlay */}
        {sel.roofing && (
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{ background: roofTint }}
          />
        )}

        {/* Area badge */}
        <div className="absolute top-2 right-2 z-[6]">
          <Badge className="bg-black/60 text-white border-0 text-[10px] backdrop-blur-sm">
            {area} m²
          </Badge>
        </div>

        {/* System badge */}
        <div className="absolute top-2 left-2 z-[6]">
          <Badge variant="secondary" className="bg-white/80 text-[10px] backdrop-blur-sm font-medium">
            {systemInfo?.label}
          </Badge>
        </div>
      </div>

      {/* Extras strip */}
      {activeExtras.length > 0 && (
        <div className="px-3 py-1.5 border-t bg-secondary/10 flex flex-wrap gap-1.5">
          {activeExtras.map(key => (
            <span key={key} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {EXTRA_LABELS[key]}
            </span>
          ))}
        </div>
      )}

      {/* Heating indicator */}
      {sel.heating && sel.heating !== "none" && (
        <div className="px-3 py-1 border-t bg-orange-50 text-[10px] text-orange-700 flex items-center gap-1">
          🔥 <span>Calefacción incluida</span>
        </div>
      )}
    </div>
  );
}