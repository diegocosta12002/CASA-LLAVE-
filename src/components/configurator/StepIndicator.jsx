import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  { label: "Modelo", number: 1 },
  { label: "Modalidad", number: 2 },
  { label: "Sistema", number: 3 },
  { label: "Ubicación", number: 4 },
  { label: "Sanitarios", number: 5 },
  { label: "Terminac.", number: 6 },
  { label: "Extras", number: 7 },
  { label: "Resumen", number: 8 },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 px-2">
      {steps.map((step, i) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-accent text-accent-foreground"
                    : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
              </motion.div>
              <span className={`text-[10px] font-medium hidden md:block ${
                isActive ? "text-primary" : isCompleted ? "text-accent" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-3 sm:w-6 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-colors ${
                currentStep > step.number ? "bg-accent" : "bg-border"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}