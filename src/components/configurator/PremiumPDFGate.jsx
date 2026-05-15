import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Lock, Sparkles, Loader2, Crown, Key, X, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/api/supabaseClient";

// Códigos maestros — pueden usarse infinitas veces
const MASTER_CODES = ["TOBYCO2024", "TOBYCO2025", "MASTER2024"];

export default function PremiumPDFGate({ onUnlocked }) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError("Por favor ingresá el código de acceso.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const upperCode = code.trim().toUpperCase();

      // Verificar si es un código maestro
      if (MASTER_CODES.includes(upperCode)) {
        setSuccess(true);
        setTimeout(() => {
          setShowCodeModal(false);
          if (onUnlocked) onUnlocked();
        }, 1500);
        return;
      }

      // Buscar el código en Supabase
      const { data, error: fetchError } = await supabase
        .from("access_codes")
        .select("*")
        .eq("code", upperCode)
        .single();

      if (fetchError || !data) {
        setError("Código inválido. Verificá que esté escrito correctamente.");
        return;
      }

      if (data.used) {
        setError("Este código ya fue utilizado.");
        return;
      }

      // Marcar el código como usado
      await supabase
        .from("access_codes")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("id", data.id);

      setSuccess(true);
      setTimeout(() => {
        setShowCodeModal(false);
        if (onUnlocked) onUnlocked();
      }, 1500);

    } catch (err) {
      setError("Error al validar el código. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-base flex items-center gap-1.5">
              Presupuesto PDF Premium
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">u$s 39,99</span>
            </div>
            <div className="text-xs text-muted-foreground">Pago único · Descarga inmediata</div>
          </div>
        </div>

        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {[
            "PDF profesional descargable con tu configuración completa",
            "Diagrama de Gantt con cronograma de obra",
            "Cronograma de desembolsos por etapa",
            "Términos y condiciones incluidos",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
            <Building2 className="w-4 h-4" /> Pago por transferencia bancaria
          </div>
          <p className="text-xs text-blue-700">
            Realizá la transferencia de <strong>u$s 39,99</strong> y envianos el comprobante a{" "}
            <a href="mailto:info@tobyco.com.ar" className="underline font-medium">info@tobyco.com.ar</a>.
            Una vez acreditado, te enviaremos tu código de acceso.
          </p>
        </div>

        <Button
          className="w-full gap-2 h-10 font-semibold"
          onClick={() => { setShowCodeModal(true); setError(""); setCode(""); }}
        >
          <Key className="w-4 h-4" /> Ya tengo mi código — Ingresar
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          ¿No tenés código? Contactanos y realizá la transferencia para obtenerlo.
        </p>
      </motion.div>

      <AnimatePresence>
        {showCodeModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCodeModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Key className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-base">Ingresar código</div>
                      <div className="text-xs text-muted-foreground">de acceso Premium</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <div className="text-center">
                      <div className="font-semibold text-green-700">¡Código válido!</div>
                      <div className="text-sm text-muted-foreground">Tu PDF Premium está desbloqueado.</div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Código de acceso</label>
                      <Input
                        placeholder="Ej: TOBYCO2024"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                        className="text-center font-mono text-base tracking-widest h-11"
                        autoFocus
                      />
                      {error && (
                        <p className="text-xs text-destructive font-medium">{error}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowCodeModal(false)}>
                        Cancelar
                      </Button>
                      <Button className="flex-1 gap-2" onClick={handleRedeem} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                        Canjear
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Los códigos individuales se usan una sola vez.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
