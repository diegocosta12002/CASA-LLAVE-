import { useState } from "react";
import { motion } from "framer-motion";
import { X, Key, Copy, CheckCircle, Loader2, RefreshCw, Mail, PenLine, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function AccessCodeModal({ lead, onClose }) {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alreadyExisted, setAlreadyExisted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [manualError, setManualError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateAccessCode", {
        lead_id: lead.id,
        lead_name: lead.name,
        lead_email: lead.email,
      });
      if (res.data?.code) {
        setCode(res.data.code);
        setAlreadyExisted(res.data.already_existed || false);
        setEmailSent(res.data.email_sent || false);
      }
    } catch (err) {
      alert("Error al generar el código: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    const trimmed = manualCode.trim().toUpperCase();
    if (!trimmed) {
      setManualError("Ingresá un código.");
      return;
    }
    setLoading(true);
    setManualError("");
    try {
      // Create the code directly in the entity
      await base44.entities.AccessCode.create({
        code: trimmed,
        lead_id: lead.id,
        lead_name: lead.name || "",
        lead_email: lead.email || "",
        used: false,
      });
      setCode(trimmed);
      setAlreadyExisted(false);
      setEmailSent(false);
      setManualMode(false);
    } catch (err) {
      setManualError("Error al guardar el código. ¿Ya existe?");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-bold text-base">Código de acceso</div>
                <div className="text-xs text-muted-foreground truncate max-w-[160px]">{lead.name}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Info */}
          <div className="bg-secondary/40 rounded-xl p-3 text-sm space-y-1">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Cliente:</span> {lead.name}
            </div>
            {lead.email && (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span> {lead.email}
              </div>
            )}
          </div>

          {/* Code display or generate/manual options */}
          {!code ? (
            !manualMode ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Generá un código automático o ingresá uno manualmente.
                </p>
                <Button className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> Generar código automático</>
                  )}
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => setManualMode(true)}>
                  <PenLine className="w-4 h-4" /> Ingresar código manualmente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Código personalizado</label>
                  <Input
                    placeholder="Ej: TOBY-XXXX-XXXX"
                    value={manualCode}
                    onChange={(e) => { setManualCode(e.target.value); setManualError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSave()}
                    className="text-center font-mono text-base tracking-widest h-11"
                    autoFocus
                  />
                  {manualError && <p className="text-xs text-destructive">{manualError}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setManualMode(false); setManualError(""); }}>
                    Volver
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleManualSave} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Guardar
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {alreadyExisted && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                  Este lead ya tenía un código generado previamente.
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Código generado</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 font-mono text-lg font-bold text-primary text-center tracking-widest select-all">
                    {code}
                  </div>
                  <Button size="icon" variant="outline" onClick={handleCopy} className="h-12 w-12 flex-shrink-0">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {emailSent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  Email enviado automáticamente a <strong>{lead.email}</strong>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground">
                  Enviá este código al cliente por email o WhatsApp una vez confirmada la transferencia.
                </p>
              )}
              <Button variant="outline" className="w-full" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}