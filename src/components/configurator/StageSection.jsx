import { motion } from "framer-motion";
import OptionCard from "./OptionCard";
import { formatCurrency } from "@/lib/pricingData";

export default function StageSection({ title, subtitle, options, selected, onSelect, getCostLabel, multiSelect = false }) {
  const handleSelect = (key) => {
    if (multiSelect) {
      const current = selected || [];
      if (current.includes(key)) {
        onSelect(current.filter(k => k !== key));
      } else {
        onSelect([...current, key]);
      }
    } else {
      onSelect(key);
    }
  };

  const isSelected = (key) => {
    if (multiSelect) return (selected || []).includes(key);
    return selected === key;
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-base">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {options.map((opt) => (
          <OptionCard
            key={opt.key}
            option={opt}
            isSelected={isSelected(opt.key)}
            onClick={() => handleSelect(opt.key)}
            costLabel={getCostLabel ? getCostLabel(opt) : null}
          />
        ))}
      </div>
    </div>
  );
}