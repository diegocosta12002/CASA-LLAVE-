import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { CONSTRUCTION_SYSTEMS, FINISH_TIERS } from "@/lib/pricingData";

const HOUSE_IMAGES = {
  small: "https://tyxszgqospzunnnehbyj.supabase.co/storage/v1/object/public/assets/casa%2080m2.jpg",
  medium: "https://tyxszgqospzunnnehbyj.supabase.co/storage/v1/object/public/assets/casa%20120m2.jpg",
  large: "https://tyxszgqospzunnnehbyj.supabase.co/storage/v1/object/public/assets/CASA%20180M2.jpeg",
};

export default function HouseVisualization({ area, system, finishMode, finishTier }) {
  const systemLabel = CONSTRUCTION_SYSTEMS[system]?.label || "Tradicional";
  const tierLabel = finishMode === "simple"
    ? (FINISH_TIERS[finishTier]?.label || "Estándar")
    : "Personalizado";

  const getHouseType = () => {
    if (area <= 90) return "small";
    if (area <= 140) return "medium";
    return "large";
  };

  const imageUrl = HOUSE_IMAGES[getHouseType()];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Vista previa
        </h3>
      </div>

      <div className="relative rounded-xl overflow-hidden border bg-secondary/30 aspect-video flex items-center justify-center">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={imageUrl}
          alt="Vista previa de la casa"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <div className="font-medium text-foreground">{systemLabel}</div>
          <div>Sistema constructivo</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <div className="font-medium text-foreground">{tierLabel}</div>
          <div>Nivel de terminación</div>
        </div>
      </div>
    </div>
  );
}